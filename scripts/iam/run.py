"""One shared IAM writer. Missing prerequisites fail, never count as no-news."""
import datetime as dt
import hashlib
import json
import os
import pathlib
import subprocess
import sys
import time
from runtime import read, save, stamp, reconcile, claim, block, complete, policy_context, digest, daily_due
from source import fetch_source
from writer import write_article
from prebuild import rules
from preparation import prepared_draft
from automatic_trigger import verify as verify_automatic_trigger
from recovery import ItemHold, eligible, recover_expired, fetch_all, retain_failure, retain_source_results
from approved_launches import pending_launches, source_checked_post

ROOT=pathlib.Path.cwd()
STATE=ROOT/'operations/iam/state.json'
JOURNAL=ROOT/'artifacts/industry-army/src/data/buildJournal.json'
PUBLIC=ROOT/'artifacts/industry-army/public'

def git(*args):
    return subprocess.check_output(['git','-c','safe.directory='+str(ROOT),*args],text=True).strip()

def persist(message):
    # Expected parent ancestry is checked by a non-force push; never overwrite concurrent work.
    git('config','user.name','IAM cloud publisher')
    git('config','user.email','iam-publisher@users.noreply.github.com')
    git('add','operations/iam','artifacts/industry-army/src/data/buildJournal.json')
    if git('diff','--cached','--name-only'):
        git('commit','-m',message)
        git('push','origin','HEAD:main')

def media_ok(media):
    from PIL import Image
    for key in ('hero','share'):
        m=media[key]
        if not m.get('rightsEvidence') or not m.get('credit') or not m.get('visualReview'):
            raise ValueError('Media lacks exact rights, credit or actual visual review')
        p=PUBLIC/m['path'].lstrip('/')
        if not p.resolve().is_relative_to(PUBLIC.resolve()): raise ValueError('Media path escapes public root')
        if hashlib.sha256(p.read_bytes()).hexdigest()!=m['sha256']: raise ValueError('Changed media requires review')
        with Image.open(p) as im:
            if im.size!=(1600,900): raise ValueError('Media must be native 1600x900 derivative')
        if m.get('upscaled') is not False or min(m.get('nativeSize',[0,0])[0]/1600,m.get('nativeSize',[0,0])[1]/900)<1:
            raise ValueError('No upscaling allowed')

def live_check(post, expected_text, state, owner):
    from playwright.sync_api import sync_playwright
    url='https://www.industryarmymarketing.com/blog/'+post['slug']
    discovery=['https://www.industryarmymarketing.com'+p for p in ('/','/blog','/rss.xml','/sitemap.xml')]
    with sync_playwright() as pw:
        launch_options={'executable_path':os.environ['IAM_BROWSER_EXECUTABLE_PATH']} if os.environ.get('IAM_BROWSER_EXECUTABLE_PATH') else {}
        browser=pw.chromium.launch(**launch_options)
        try:
            # Deployment is asynchronous. Poll within a bounded lease and renew it.
            for attempt in range(30):
                page=browser.new_page(viewport={'width':1440,'height':1000})
                r=page.goto(url,wait_until='networkidle',timeout=45000)
                if r and r.status==200 and page.locator('h1').inner_text()==post['title']:
                    break
                page.close()
                from runtime import renew
                renew(state,owner,dt.datetime.now(dt.timezone.utc)); save(STATE,state)
                time.sleep(15)
            else: raise ValueError('Production did not expose exact article within timeout')
            if page.locator('link[rel="canonical"]').get_attribute('href')!=url: raise ValueError('Wrong canonical')
            schemas=page.locator('script[type="application/ld+json"]').all_text_contents()
            if not any(post['title'] in s and ('BlogPosting' in s or 'Article' in s) for s in schemas): raise ValueError('Missing matching schema')
            for width,height,label in [(1440,1000,'desktop'),(390,844,'phone')]:
                page.set_viewport_size({'width':width,'height':height})
                checks=page.evaluate('''() => ({overflow:document.documentElement.scrollWidth>innerWidth, images:[...document.images].filter(i=>i.getBoundingClientRect().width>100).map(i=>({ok:i.complete&&i.naturalWidth>0,src:i.src}))})''')
                if checks['overflow'] or not checks['images'] or not all(i['ok'] for i in checks['images']): raise ValueError('Actual browser layout/image failure')
                page.screenshot(path=str(ROOT/'operations/iam'/('latest-'+label+'.png')),full_page=True)
            for link in discovery:
                r=page.request.get(link)
                if r.status!=200 or post['slug'] not in r.text(): raise ValueError('Missing discovery link: '+link)
            return dict(http=True,canonical=True,schema=True,discovery=True,desktop=True,phone=True,image=True,
                        runUrl=os.environ['IAM_RUN_URL'],trigger=os.environ.get('GITHUB_EVENT_NAME','unknown'),browserVersion=browser.version,browserExecutable=os.environ.get('IAM_BROWSER_EXECUTABLE_PATH','bundled-chromium'))
        finally: browser.close()

def cycle(excluded):
    loaded=rules(ROOT,remote=os.environ.get('GITHUB_ACTIONS')=='true')
    policy=read('operations/iam/policy.json')
    policy_hash=digest(policy)
    journal=read(JOURNAL)
    state=reconcile(read(STATE),journal,read('docs/campaigns/construction-hourly/queue-baseline.json'))
    recover_expired(state,journal,dt.datetime.now(dt.timezone.utc))
    automatic=verify_automatic_trigger()
    state['loadedRules']=loaded
    owner=os.environ.get('GITHUB_RUN_ID','local-dryrun')+'-'+os.environ.get('GITHUB_RUN_ATTEMPT','1')
    state['lastRun']={'at':stamp(),'owner':owner,'trigger':os.environ.get('GITHUB_EVENT_NAME','local'),'status':'checking','policyDigest':policy_hash,'rules':loaded,'automaticRecovery':automatic}
    pending=[a for a in read('docs/campaigns/construction-hourly/queue-baseline.json')['articles'] if state['rows'][a['slug']]['status'] in ('pending','retry')]
    approved = pending_launches(ROOT, state, journal)
    if approved: pending = approved + pending
    existing={p['slug']:p for p in journal}
    resumes=[{'slug':slug,'siteDomain':row['sourceDomain'],'resumePost':existing[slug]} for slug,row in state['rows'].items() if row.get('status')=='verification-pending' and slug in existing]
    pending=resumes+pending
    pending=[a for a in pending if a['slug'] not in excluded and eligible(state['rows'][a['slug']],dt.datetime.now(dt.timezone.utc))]
    daily=False
    try:
        if state.get('lease') and dt.datetime.fromisoformat(state['lease']['until'])>dt.datetime.now(dt.timezone.utc) and state['lease']['owner']!=owner:
            raise RuntimeError('Active IAM writer lease: do not compete')
        now=dt.datetime.now(dt.timezone.utc)
        if daily_due(now,state):
            try:intake=read('operations/iam/release-intake.json')
            except (OSError,ValueError):intake={}
            if not intake.get('checkedAt') or (now-dt.datetime.fromisoformat(intake['checkedAt'])).total_seconds()>3600:
                state.setdefault('persistentBlockers',{})['iam:daily-release-intake']={
                    'id':'iam:daily-release-intake','kind':'daily-intake','status':'open','observedAt':stamp(),
                    'reason':'DAILY_RELEASE_INTAKE_STALE','nextAction':'Connect fresh verified release receipts; independent campaign items continue.'}
                intake={'releases':[],'checkedAt':None}
            elif state.get('persistentBlockers',{}).get('iam:daily-release-intake',{}).get('status')=='open':
                state['persistentBlockers']['iam:daily-release-intake'].update(status='resolved',resolvedAt=stamp(),resolution='Fresh intake receipt observed')
            releases=[r for r in intake['releases'] if r.get('verifiedAt') and r.get('http')==200 and r.get('receiptUrl') and not r.get('usedInJournal')]
            if releases:
                r=releases[0];slug=r['slug']
                if slug not in state['rows']:
                    state['rows'][slug]={'status':'pending','attempts':0,'sourceDomain':r['sourceDomain'],'canonical':'https://www.industryarmymarketing.com/blog/'+slug}
                pending=[{'slug':slug,'siteDomain':r['sourceDomain'],'intent':r['intent'],'primarySources':r['sourceUrls'],'requiredContact':'/contact?request=industry-publishing'}]
                daily=True
            elif intake.get('checkedAt'):
                state['dailyJournalDate']=now.astimezone(__import__('zoneinfo').ZoneInfo('America/Vancouver')).date().isoformat()
                state['lastDailyCheck']={'at':stamp(),'status':'healthy-no-verified-release','intakeCheckedAt':intake['checkedAt']}
        if not pending:
            unresolved=[r for r in state['rows'].values() if r['status'] not in ('verified','existing-publication','withdrawn')]
            if unresolved: raise RuntimeError('Remaining campaign is blocked, not complete')
            state['lastRun']['status']='finite-campaign-complete'
            return
        if not ((pending[0].get('approvedPost') and not pending[0].get('generateAndAudit')) or pending[0].get('resumePost')) and not os.environ.get('OPENAI_API_KEY'): raise RuntimeError('IAM_OPENAI_KEY_MISSING: install separate authorized repository secret; never copy another restricted key')
        if not ((pending[0].get('approvedPost') and not pending[0].get('generateAndAudit')) or pending[0].get('resumePost')) and not os.environ.get('OPENAI_MODEL'): raise RuntimeError('IAM_OPENAI_MODEL_MISSING: select model available to IAM key')
        now=dt.datetime.now(dt.timezone.utc)
        if state.get('lastVerifiedAt') and (now-dt.datetime.fromisoformat(state['lastVerifiedAt'])).total_seconds()<3600:
            state['lastRun']['status']='cadence-not-due'; return
        article=pending[0];slug=article['slug']
        if article.get('resumePost'):state['rows'][slug]['status']='retry'
        claim(state,slug,owner,now);save(STATE,state);persist('IAM: claim sole hourly writer')
        published=bool(article.get('resumePost'));stage='preflight'
        try:
            if article.get('resumePost'):
                post=article['resumePost'];evidence=live_check(post,'',state,owner)
                evidence.update(rules=loaded,recoveredExistingCanonical=True,automaticRecovery=automatic,productionVerified=True,generatedAndAudited=state['rows'][slug].get('publicationAuthorship')=='generated')
                complete(state,slug,owner,evidence,dt.datetime.now(dt.timezone.utc))
                state['lastRun']['status']='verified-recovered-publication';return
            # Real shared-site regressions stop new publishing, even if the next draft is ready.
            for recent in sorted(journal,key=lambda p:p['publishedAt'],reverse=True)[:3]:
                live_check(recent,'',state,owner)
            stage='media'
            media=read('operations/iam/media.json').get(slug)
            if not media: raise ValueError('Exact company/source media and actual visual review missing for '+article['siteDomain'])
            media_ok(media)
            stage='source'
            sources,source_failures=fetch_all(article.get('primarySources',[]),fetch_source)
            state['rows'][slug]['sourceFailures']=source_failures
            retain_source_results(state,slug,sources,source_failures,stamp())
            if not sources: raise __import__('urllib.error',fromlist=['URLError']).URLError('All assigned sources failed')
            stage='generation'
            manual=bool(article.get('approvedPost')) and not article.get('generateAndAudit')
            if manual:
                post=source_checked_post(article,sources)
                if post['image']!=media['hero']['path'] or post['ogImage']!=media['share']['path']:
                    raise ValueError('Reviewed manuscript/media mismatch')
                draft={'intro':post['richContent']['intro']}
            else:
                context=policy_context(policy,sources)
                context['policy']={**policy,'canonicalSot':(ROOT/'docs/IAM-SOT.md').read_text()}
                if article.get('generateAndAudit'):
                    template=source_checked_post(article,sources)
                    context.update(requiredTitle=template['title'],requiredBrandStatement=article.get('requiredBrandStatement'))
                    context['policy']['ownerAuthorizedLaunch']={'site':article['siteDomain'],'title':template['title'],'relationship':article.get('requiredBrandStatement')}
                context.update(intent=('Welcome '+article['siteDomain']+' as a new IAM network site; describe its actual launch purpose and features, preserve its verified parent brand' if article.get('generateAndAudit') else article['intent']),existingTitles=[p['title'] for p in journal],siteDomain=article['siteDomain'])
                draft=prepared_draft(ROOT,article,sources) if article.get('generateAndAudit') else None
                if draft is None:draft=write_article(context)
                if digest(read('operations/iam/policy.json'))!=policy_hash: raise ValueError('Approved policy changed; discard stale draft')
                post={**policy['postDefaults'],'slug':slug,'title':draft['title'],'cardTitle':draft['title'],
                      'excerpt':draft['excerpt'],'metaDescription':draft['excerpt'],'publishedAt':stamp(),
                      'date':now.astimezone(__import__('zoneinfo').ZoneInfo('America/Vancouver')).strftime('%B %d, %Y'),
                      'image':media['hero']['path'],'ogImage':media['share']['path'],'imageAlt':media['hero']['credit'],
                      'ogImageAlt':media['share']['credit'],'campaignSite':article['siteDomain'],'campaignLabel':article['intent'],
                      'richContent':{'intro':draft['intro'],'sections':draft['sections'],'sources':[{'label':s['url'],'href':s['url']} for s in sources]},
                      'cta':{'eyebrow':'INDUSTRY ARMY MARKETING','heading':'Explain your work clearly','body':'Discuss your branding and publishing with IAM. Project enquiries stay with the named source company.','buttonText':'Talk with IAM','buttonHref':article['requiredContact']}}
            if digest(read('operations/iam/policy.json'))!=policy_hash:
                raise ValueError('Approved policy changed; discard stale draft')
            post.update(publishedAt=stamp(),date=dt.datetime.now(dt.timezone.utc).astimezone(__import__('zoneinfo').ZoneInfo('America/Vancouver')).strftime('%B %d, %Y'))
            if rules(ROOT,remote=os.environ.get('GITHUB_ACTIONS')=='true')['hashes']!=loaded['hashes']:
                raise RuntimeError('Loaded canonical rules changed before publication')
            stage='publication'
            if any(p['slug']==slug for p in journal): raise ValueError('Duplicate existing canonical')
            state['rows'][slug].update(stage='uploading',publicationAuthorship='manual' if manual else 'generated',sourceEvidence=[{'url':v['url'],'sha256':v.get('sha256')} for v in sources],articleSha256=hashlib.sha256(json.dumps(post,sort_keys=True).encode()).hexdigest())
            if not manual:save(ROOT/'operations/iam/drafts'/(slug+'.json'),draft)
            journal.insert(0,post);save(JOURNAL,journal);persist('IAM: publish reviewed authorized launch' if manual else 'IAM: publish one independently audited network article')
            published=True;stage='verification'
            evidence=live_check(post,draft['intro'],state,owner)
            evidence.update(rules=loaded,productionVerified=True,generatedAndAudited=not manual,automaticRecovery=automatic)
            if manual:
                evidence.update(authorship='user-authorized-manual',automaticAuthorship=False)
            complete(state,slug,owner,evidence,dt.datetime.now(dt.timezone.utc))
            if daily:
                state['dailyJournalDate']=now.astimezone(__import__('zoneinfo').ZoneInfo('America/Vancouver')).date().isoformat()
                intake=read('operations/iam/release-intake.json')
                for r in intake['releases']:
                    if r['slug']==slug:r['usedInJournal']=post['slug']
                save('operations/iam/release-intake.json',intake)
            state['lastRun']['status']='verified-publication'
        except Exception as e:
            retain_failure(state,slug,stage,e,dt.datetime.now(dt.timezone.utc),published=published)
            if stage in ('media','source') or (stage=='generation' and isinstance(e,ValueError)):
                raise ItemHold(slug) from e
            raise
    except Exception as e:
        state['lastRun'].update(status='item-held-continuing' if isinstance(e,ItemHold) else 'failed',error=type(e).__name__ if hasattr(e,'headers') else str(e)[:350],nextAction='Resolve the exact recorded gate; do not reset attempts, reseed history or count zero as publication')
        raise
    finally:
        save(STATE,state)
        if os.environ.get('GITHUB_ACTIONS')=='true': persist('IAM: preserve run outcome and publication evidence')

def main():
    excluded=set();started=time.monotonic()
    for _ in range(8):
        if time.monotonic()-started>900:break
        try:
            cycle(excluded);return
        except ItemHold as error:
            excluded.add(error.slug)
    state=read(STATE)
    state.setdefault('lastRun',{}).update(status='bounded-item-holds',heldSlugs=sorted(excluded),
        nextAction='Exact item holds retained; later candidates remain queued for the next bounded invocation. No publication implied.')
    save(STATE,state)
    if os.environ.get('GITHUB_ACTIONS')=='true':persist('IAM: retain bounded item holds without stopping later queue work')
    return {'status':'bounded-item-holds','heldSlugs':sorted(excluded),'publicationVerified':False}

if __name__=='__main__': main()



"""Independent read-only IAM desktop/phone evidence; never publishes or submits leads."""
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import time
import urllib.request
from prebuild import rules
from media_contract import CONFIG, JOURNAL, coverage, inventory

ROOT=Path(__file__).resolve().parents[2]
BASE='https://www.industryarmymarketing.com'
ROUTES=['/','/blog','/guest-post','/contact?request=guest-post','/network','/how-it-works','/blog/naturopaths-io-welcome-clearer-health-questions']
def canonical_for(route):
    return BASE+route.split('?',1)[0]
def assert_scope(config):
    if set(config.get('roleSotRefs',{}))!={'worker','visual-checker','supervisor','independent-watchdog'}:
        raise ValueError('Canonical four-role SOT references required')
    return config['roleSotRefs']['visual-checker']
def main():
    from playwright.sync_api import sync_playwright
    output=ROOT/'operations/iam/runner-smoke';output.mkdir(parents=True,exist_ok=True)
    journal=json.loads((ROOT/JOURNAL).read_text())
    registry=json.loads((ROOT/'operations/iam/media.json').read_text())
    media_config=json.loads((ROOT/CONFIG).read_text())
    media=coverage(ROOT,journal,registry,media_config)
    media_inventory=inventory(ROOT,journal,registry)
    (output/'journal-media-inventory.json').write_text(json.dumps(media_inventory,indent=2)+'\n')
    routes=list(dict.fromkeys(ROUTES+list(media['browserPosts'])))
    loaded=rules(ROOT,remote=os.environ.get('GITHUB_ACTIONS')=='true')
    config=json.loads((ROOT/'operations/iam/build-contract.json').read_text())
    role_ref=assert_scope(config)
    revision=re.search(r'revision ([0-9.]+)',(ROOT/'docs/IAM-SOT.md').read_text()).group(1)
    result={'site':'industryarmymarketing.com','role':'visual-checker','roleSotRef':role_ref,'loadedRevision':revision,'loadedHash':loaded['hashes']['docs/IAM-SOT.md'],'rules':loaded,'pageQualityVersion':1,'checkedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'trigger':os.environ.get('GITHUB_EVENT_NAME','local'),'observerSourceCommit':loaded['sourceCommit'],'observerRunHeadSha':os.environ.get('GITHUB_SHA'),'runRef':'https://github.com/SHTFTV/industryarmymarketing.com/actions/runs/'+os.environ.get('GITHUB_RUN_ID','local'),'publicationMutation':False,'leadSubmission':False,'imageCheckScope':'Images intersecting each captured viewport; offscreen lazy images are not reported as broken before loading','checks':[],'errors':[],'status':'checking'}
    result['mediaContracts']=media
    result['journalVisualStatus']=media_inventory['status']
    result['journalAssetCounts']=media_inventory['assetCounts']
    result['journalArticleCount']=media_inventory['articleCount']
    result['errors'].extend({'stage':'media-contract',**error} for error in media['errors'])
    checked_assets={}
    try:
        executable=shutil.which('google-chrome') or shutil.which('google-chrome-stable')
        if not executable:raise RuntimeError('Runner Chrome executable missing')
        result['browserExecutable']=executable
        # Wait a bounded interval for the production build to load this approved SOT.
        deadline=time.monotonic()+150
        while True:
            try:
                with urllib.request.urlopen(BASE+'/source-version.json',timeout=15) as response:identity=json.load(response)
                if identity.get('repository')=='SHTFTV/industryarmymarketing.com' and identity.get('sotSha256')==result['loadedHash']:
                    converged=True
                    for route,expected in media['browserPosts'].items():
                        with urllib.request.urlopen(BASE+route,timeout=15) as article_response: article_html=article_response.read().decode()
                        if expected['hero']['path'] not in article_html:converged=False;break
                    if converged:break
            except (OSError,ValueError):pass
            if time.monotonic()>=deadline:raise RuntimeError('Production approved SOT identity did not converge within150seconds')
            time.sleep(10)
        result['deploymentSourceCommit']=identity.get('sourceCommit')
        result['sourceBindingScope']='Observed production repository/SOT identity; full shared A-to-B provider transaction verification remains separate'
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=executable)
            try:
                result['browserVersion']=browser.version
                for width,height in [(1440,1000),(390,844)]:
                    page=browser.new_page(viewport={'width':width,'height':height})
                    for route in routes:
                        label=route.split('?')[0].strip('/').replace('/','-') or 'home'
                        check={'route':route,'width':width,'height':height}
                        try:
                            response=page.goto(BASE+route,wait_until='networkidle',timeout=45000)
                            if response.status!=200:raise AssertionError('HTTP status '+str(response.status))
                            expected=canonical_for(route)
                            if page.locator('link[rel="canonical"]').get_attribute('href')!=expected:raise AssertionError('Wrong canonical')
                            if page.locator('h1').count()!=1:raise AssertionError('Expected one visible page heading')
                            page.wait_for_function('''() => [...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}).every(i=>i.complete&&i.naturalWidth>0)''',timeout=15000)
                            layout=page.evaluate('''() => ({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&(!i.complete||!i.naturalWidth)}).length})''')
                            if layout['overflow'] or layout['broken']:raise AssertionError('Overflow or visible broken image')
                            if route=='/guest-post' and 'Guest article submissions are currently closed' not in page.locator('body').inner_text():raise AssertionError('Guest article gate missing')
                            if route.startswith('/contact'):
                                check['enquiryMode']=page.locator('[data-enquiry-mode]').get_attribute('data-enquiry-mode')
                                if 'Article submissions are closed' not in page.locator('body').inner_text():raise AssertionError('Guest interest notice missing')
                            if route in media['browserPosts']:
                                bound=media['browserPosts'][route]
                                image_path=bound['hero']['path']
                                if page.locator('h1').inner_text()!=bound['title']:raise AssertionError('Article title differs from reviewed post')
                                if bound['disallowInlineMedia'] and page.locator('[data-iam-journal-article]').evaluate('''article=>[...article.querySelectorAll('img')].some(i=>(i.getAttribute('src')||'').split(/[?#]/)[0].toLowerCase().endsWith('.svg'))'''):raise AssertionError('Removed decorative SVG images remain in the live article')
                                article_text=page.locator('[data-iam-journal-article]').inner_text()
                                if any(paragraph not in article_text for paragraph in bound['requiredLiveParagraphs']):raise AssertionError('Required corrected image-provenance paragraph is missing')
                                hero=page.locator('[data-iam-journal-article] img[src="'+image_path+'"]')
                                if hero.count()!=1:raise AssertionError('Exact registered hero missing')
                                hero.scroll_into_view_if_needed()
                                page.wait_for_function('''src => [...document.images].some(i=>i.getAttribute('src')===src&&i.complete&&i.naturalWidth===1600&&i.naturalHeight===900)''',arg=image_path,timeout=15000)
                                for selector in ['meta[property="og:image"]','meta[name="twitter:image"]']:
                                    if page.locator(selector).get_attribute('content')!=BASE+bound['share']['path']:raise AssertionError('Registered sharing image mismatch')
                                check['imageGeometry']=hero.evaluate('''i=>({native:[i.naturalWidth,i.naturalHeight],display:[i.clientWidth,i.clientHeight],alt:i.alt,src:i.src,objectFit:getComputedStyle(i).objectFit})''')
                                geometry=check['imageGeometry']
                                if abs(geometry['display'][0]/geometry['display'][1]-16/9)>0.02:raise AssertionError('Registered hero is distorted or cropped')
                                caption=hero.locator('xpath=following-sibling::p[1]')
                                if caption.inner_text()!=bound['caption'] or hero.get_attribute('alt')!=bound['caption']:raise AssertionError('Exact photo credit/caption missing')
                                check['captionGeometry']=caption.evaluate('''p=>({fontSize:parseFloat(getComputedStyle(p).fontSize),width:p.clientWidth,scrollWidth:p.scrollWidth,text:p.innerText})''')
                                if check['captionGeometry']['fontSize']<12 or check['captionGeometry']['scrollWidth']>check['captionGeometry']['width']:raise AssertionError('Photo credit is too small or overflows')
                                check['liveAssets']={}
                                for kind in ('hero','share'):
                                    asset=bound[kind]
                                    if asset['path'] not in checked_assets:
                                        with urllib.request.urlopen(BASE+asset['path'],timeout=20) as asset_response: payload=asset_response.read()
                                        checked_assets[asset['path']]=hashlib.sha256(payload).hexdigest()
                                    if checked_assets[asset['path']]!=asset['sha256']:raise AssertionError('Live '+kind+' bytes differ from reviewed source')
                                    check['liveAssets'][kind]={'path':asset['path'],'sha256':checked_assets[asset['path']]}
                                hero.screenshot(path=str(output/(bound['slug']+'-hero-'+str(width)+'.png')))
                                caption.screenshot(path=str(output/(bound['slug']+'-credit-'+str(width)+'.png')))
                                check.update(sourcePostSha256=bound['sourcePostSha256'],sharingImage=BASE+bound['share']['path'],visualReviewStatus='separate-manual-review-required',liveArticleBindingScope='Title, caption, exact hero/share bytes, configured required paragraphs and SVG-removal check. Full live article body digest is not validated.')
                            if route=='/blog':
                                check['registeredCards']=[]
                                for article_route,bound in media['browserPosts'].items():
                                    card=page.locator('a[href="'+article_route+'"] img').first
                                    if not card.count():
                                        check['registeredCards'].append({'route':article_route,'status':'not-in-current-listing'});continue
                                    card.scroll_into_view_if_needed()
                                    page.wait_for_function('''src=>[...document.images].some(i=>i.getAttribute('src')===src&&i.complete&&i.naturalWidth===1600&&i.naturalHeight===900)''',arg=bound['hero']['path'],timeout=15000)
                                    if card.get_attribute('src')!=bound['hero']['path']:raise AssertionError('Registered card uses stale image')
                                    card.locator('xpath=../..').screenshot(path=str(output/(bound['slug']+'-card-'+str(width)+'.png')))
                                    check['registeredCards'].append({'route':article_route,'status':'passed','path':bound['hero']['path']})
                            page.screenshot(path=str(output/(label+'-'+str(width)+'.png')))
                            check.update(status='passed',layout=layout,canonical=expected,screenshot=label+'-'+str(width)+'.png')
                        except Exception as exc:
                            check.update(status='failed',reason=type(exc).__name__+': '+str(exc)[:240]);result['errors'].append(check)
                            try:page.screenshot(path=str(output/(label+'-'+str(width)+'-failed.png')))
                            except Exception:pass
                        result['checks'].append(check)
                    page.close()
            finally:browser.close()
        for route in ['/rss.xml','/sitemap.xml']:
            with urllib.request.urlopen(BASE+route,timeout=20) as response:
                body=response.read().decode();assert response.status==200 and 'naturopaths-io-welcome-clearer-health-questions' in body
        if rules(ROOT,remote=os.environ.get('GITHUB_ACTIONS')=='true')['hashes']!=loaded['hashes']:raise RuntimeError('Canonical approved SOT changed during checker run')
        result['status']='failed' if result['errors'] else 'mechanical-pass-review-pending'
        result['proofBoundary']='Real rendered artifacts; no automatic taste/rights/editorial approval, private intake proof, new publication or whole-site certification'
    except Exception as exc:
        result['status']='failed';result['errors'].append({'stage':'checker','reason':type(exc).__name__+': '+str(exc)[:300]})
    finally:
        result['completedAt']=dt.datetime.now(dt.timezone.utc).isoformat()
        (output/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
    if result['status']=='failed':raise SystemExit(1)
if __name__=='__main__':main()


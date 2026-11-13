"""Independent read-only IAM desktop/phone evidence; never publishes or submits leads."""
import datetime as dt
import json
import os
from pathlib import Path
import re
import shutil
import time
import urllib.request
from prebuild import rules

ROOT=Path(__file__).resolve().parents[2]
BASE='https://www.industryarmymarketing.com'
ROUTES=['/','/blog','/guest-post','/contact?request=guest-post','/network','/how-it-works','/blog/naturopaths-io-welcome-clearer-health-questions']
BUILDERS_SLUG='builders-ltd-welcome-house-building-field-guide'
BUILDERS_ROUTE='/blog/'+BUILDERS_SLUG
BUILDERS_IMAGE='/brand-journal/builders-ltd-welcome-v2.webp'
ROUTES.append(BUILDERS_ROUTE)
def canonical_for(route):
    return BASE+route.split('?',1)[0]
def assert_scope(config):
    if set(config.get('roleSotRefs',{}))!={'worker','visual-checker','supervisor','independent-watchdog'}:
        raise ValueError('Canonical four-role SOT references required')
    return config['roleSotRefs']['visual-checker']
def main():
    from playwright.sync_api import sync_playwright
    output=ROOT/'operations/iam/runner-smoke';output.mkdir(parents=True,exist_ok=True)
    loaded=rules(ROOT,remote=os.environ.get('GITHUB_ACTIONS')=='true')
    config=json.loads((ROOT/'operations/iam/build-contract.json').read_text())
    role_ref=assert_scope(config)
    revision=re.search(r'revision ([0-9.]+)',(ROOT/'docs/IAM-SOT.md').read_text()).group(1)
    result={'site':'industryarmymarketing.com','role':'visual-checker','roleSotRef':role_ref,'loadedRevision':revision,'loadedHash':loaded['hashes']['docs/IAM-SOT.md'],'rules':loaded,'pageQualityVersion':1,'checkedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'trigger':os.environ.get('GITHUB_EVENT_NAME','local'),'observerSourceCommit':loaded['sourceCommit'],'observerRunHeadSha':os.environ.get('GITHUB_SHA'),'runRef':'https://github.com/SHTFTV/industryarmymarketing.com/actions/runs/'+os.environ.get('GITHUB_RUN_ID','local'),'publicationMutation':False,'leadSubmission':False,'imageCheckScope':'Images intersecting each captured viewport; offscreen lazy images are not reported as broken before loading','checks':[],'errors':[],'status':'checking'}
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
                    with urllib.request.urlopen(BASE+BUILDERS_ROUTE,timeout=15) as article_response: builders_html=article_response.read().decode()
                    if BUILDERS_IMAGE in builders_html:break
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
                    for route in ROUTES:
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
                            if route==BUILDERS_ROUTE:
                                hero=page.locator('img[src="'+BUILDERS_IMAGE+'"]')
                                if hero.count()!=1:raise AssertionError('Exact Builders hero missing')
                                hero.scroll_into_view_if_needed()
                                page.wait_for_function('''src => [...document.images].some(i=>i.getAttribute('src')===src&&i.complete&&i.naturalWidth===1600&&i.naturalHeight===900)''',arg=BUILDERS_IMAGE,timeout=15000)
                                for selector in ['meta[property="og:image"]','meta[name="twitter:image"]']:
                                    if page.locator(selector).get_attribute('content')!=BASE+BUILDERS_IMAGE:raise AssertionError('Builders sharing image mismatch')
                                check['imageGeometry']=hero.evaluate('''i=>({native:[i.naturalWidth,i.naturalHeight],display:[i.clientWidth,i.clientHeight],alt:i.alt,src:i.src})''')
                                if abs(check['imageGeometry']['display'][0]/check['imageGeometry']['display'][1]-16/9)>0.02:raise AssertionError('Distorted Builders hero')
                                hero.screenshot(path=str(output/('builders-hero-'+str(width)+'.png')))
                                page.screenshot(path=str(output/('builders-article-'+str(width)+'.png')))
                                check['sharingImage']=BASE+BUILDERS_IMAGE
                            if route=='/blog':
                                card_image=page.locator('a[href="'+BUILDERS_ROUTE+'"] img').first
                                card_image.scroll_into_view_if_needed()
                                page.wait_for_function('''src=>[...document.images].some(i=>i.getAttribute('src')===src&&i.complete&&i.naturalWidth===1600)''',arg=BUILDERS_IMAGE,timeout=15000)
                                if card_image.get_attribute('src')!=BUILDERS_IMAGE:raise AssertionError('Builders card uses stale image')
                                card_image.locator('xpath=../..').screenshot(path=str(output/('builders-card-'+str(width)+'.png')))
                                page.screenshot(path=str(output/('builders-listing-'+str(width)+'.png')))
                                check['buildersCardImage']=BUILDERS_IMAGE
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

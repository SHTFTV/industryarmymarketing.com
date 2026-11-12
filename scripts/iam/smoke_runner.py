"""Read-only production browser proof using the existing runner's installed Chrome."""
import json
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

def main():
    executable=shutil.which('google-chrome') or shutil.which('google-chrome-stable')
    if not executable:raise RuntimeError('Runner Chrome executable missing')
    base='https://www.industryarmymarketing.com';slug='naturopaths-io-welcome-clearer-health-questions'
    output=Path('operations/iam/runner-smoke');output.mkdir(parents=True,exist_ok=True)
    result={'publicationMutation':False,'browserExecutable':executable,'checks':[]}
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=executable)
        try:
            result['browserVersion']=browser.version
            page=browser.new_page(viewport={'width':1440,'height':1000})
            response=page.goto(base+'/blog/'+slug,wait_until='networkidle',timeout=45000)
            assert response.status==200
            assert page.locator('h1').inner_text()=='Industry Army Marketing Welcomes Naturopaths.io'
            assert page.locator('link[rel="canonical"]').get_attribute('href')==base+'/blog/'+slug
            for width in [1440,390]:
                page.set_viewport_size({'width':width,'height':1000})
                page.wait_for_function('''() => [...document.images].filter(i=>i.getBoundingClientRect().width>100).every(i=>i.complete&&i.naturalWidth>0)''')
                check=page.evaluate('''() => ({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].filter(i=>i.getBoundingClientRect().width>100).map(i=>({ok:i.complete&&i.naturalWidth>0}))})''')
                assert not check['overflow'] and check['images'] and all(i['ok'] for i in check['images'])
                result['checks'].append(check);page.screenshot(path=str(output/(str(width)+'.png')))
            for route in ['/','/blog','/rss.xml','/sitemap.xml']:
                response=page.request.get(base+route);assert response.status==200 and slug in response.text()
            result['discovery']=True
        finally:browser.close()
    (output/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))

if __name__=='__main__':main()

"""Independently verify the same-repository health dispatch; never relabel a push."""
import datetime as dt
import json
import os
import re
import urllib.request

REPO='SHTFTV/industryarmymarketing.com'
def verify(env=None,fetch=None,now=None):
    env=env if env is not None else os.environ;now=now or dt.datetime.now(dt.timezone.utc)
    if env.get('GITHUB_EVENT_NAME')!='workflow_dispatch' or env.get('IAM_AUTOMATIC_RECOVERY')!='true':
        return {'verified':False,'reason':'Not an automatic health recovery dispatch'}
    if env.get('GITHUB_REPOSITORY')!=REPO or env.get('GITHUB_ACTOR')!='github-actions[bot]':
        return {'verified':False,'reason':'Recovery actor/repository mismatch'}
    origin=env.get('IAM_RECOVERY_ORIGIN_RUN','')
    match=re.fullmatch(r'https://github\.com/SHTFTV/industryarmymarketing\.com/actions/runs/(\d+)',origin)
    if not match:return {'verified':False,'reason':'Invalid recovery origin'}
    try:
        if fetch:run=fetch(match[1])
        else:
            request=urllib.request.Request('https://api.github.com/repos/'+REPO+'/actions/runs/'+match[1],headers={
                'Authorization':'Bearer '+env['GITHUB_TOKEN'],'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10'})
            with urllib.request.urlopen(request,timeout=20) as response:run=json.load(response)
        age=(now-dt.datetime.fromisoformat(run['run_started_at'].replace('Z','+00:00'))).total_seconds()
        valid=run.get('path')=='.github/workflows/iam-health.yml' and run.get('head_branch')=='main' and run.get('repository',{}).get('full_name')==REPO and 0<=age<=1800
        return {'verified':valid,'kind':'verified-health-recovery' if valid else 'unverified-health-recovery','originRun':origin,'originEvent':run.get('event'),
                'reason':'Actual same-repository health run and GitHub Actions bot verified' if valid else 'Origin workflow/branch/repository/time mismatch'}
    except Exception as error:return {'verified':False,'reason':'Recovery verification unavailable: '+type(error).__name__}

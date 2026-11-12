"""Bounded health dispatch to IAM's sole publisher, without access to its writer key."""
import datetime as dt
import json
import os
import pathlib
import sys
import urllib.request

ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts/iam'))
from poll_due import should_execute

REPO='SHTFTV/industryarmymarketing.com'
WORKFLOW='iam-publisher.yml'

def decision(state,runs,now,probe=False):
    active=[r for r in runs if r.get('status') in ('queued','in_progress','waiting','pending','requested')]
    if active:return {'dispatch':False,'reason':'Existing sole publisher active','activeRun':active[0]['html_url']}
    if runs:
        latest=max(dt.datetime.fromisoformat(r['created_at'].replace('Z','+00:00')) for r in runs)
        if (now-latest).total_seconds()<600:return {'dispatch':False,'reason':'Ten-minute dispatch spacing retained'}
    if not probe and not should_execute(state,'schedule',now):return {'dispatch':False,'reason':'No eligible publication work; no model, browser or deploy requested'}
    return {'dispatch':True,'reason':'Bounded deployment probe' if probe else 'Eligible work and missing recent publisher execution'}

def main():
    if os.environ.get('GITHUB_REPOSITORY')!=REPO:raise RuntimeError('IAM recovery scope mismatch')
    token=os.environ['GITHUB_TOKEN']
    def api(path,method='GET',body=None):
        request=urllib.request.Request('https://api.github.com/repos/'+REPO+path,method=method,
            data=json.dumps(body).encode() if body is not None else None,
            headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','Content-Type':'application/json'})
        with urllib.request.urlopen(request,timeout=25) as response:
            raw=response.read();return json.loads(raw) if raw else {'httpStatus':response.status}
    workflow=api('/actions/workflows/'+WORKFLOW)
    if workflow.get('state')!='active':raise RuntimeError('Existing publisher workflow inactive; preserve exact operational gate')
    runs=api('/actions/workflows/'+WORKFLOW+'/runs?branch=main&per_page=10')['workflow_runs']
    now=dt.datetime.now(dt.timezone.utc)
    state=json.loads((ROOT/'operations/iam/state.json').read_text())
    result=decision(state,runs,now,probe=os.environ.get('GITHUB_EVENT_NAME')=='push')
    result.update(checkedAt=now.isoformat(),originRun='https://github.com/'+REPO+'/actions/runs/'+os.environ['GITHUB_RUN_ID'],publicationVerified=False)
    if result['dispatch']:
        accepted=api('/actions/workflows/'+WORKFLOW+'/dispatches','POST',{'ref':'main','inputs':{'automatic_recovery':True,'recovery_origin_run':result['originRun']}})
        result['dispatchAccepted']=True
        result['acceptanceHttpStatus']=accepted.get('httpStatus',200)
        result['proof']='Dispatch acceptance only; child execution and publication require independent receipts'
    print(json.dumps(result))
    summary=os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary,'a') as output:output.write('```json\n'+json.dumps(result,indent=2)+'\n```\n')

if __name__=='__main__':main()

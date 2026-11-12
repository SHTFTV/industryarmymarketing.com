"""Independent job-level evidence, including failures before run.py can execute."""
import datetime as dt
import json
import os
import pathlib
import re
import subprocess
import urllib.request
from prebuild import assess
from blockers import observe

def execution(jobs, state, context):
    publish=next((j for j in jobs if j['name']=='publish'),None)
    if not publish:raise ValueError('Actual publish job missing from GitHub response')
    steps=publish.get('steps',[])
    writer=next((s for s in steps if s['name']=='One source-to-verified-publication transaction'),{})
    failures=[s['name'] for s in steps if s.get('conclusion') in ('failure','cancelled','timed_out')]
    receipts=[r for r in state.get('receipts',[]) if r.get('runUrl')==context['runUrl']]
    return {'checkedAt':context['checkedAt'],'runUrl':context['runUrl'],'event':context['event'],
            'startedAt':publish.get('started_at'),'completedAt':publish.get('completed_at'),
            'jobResult':publish.get('conclusion') or context['jobResult'],
            'failedSteps':failures,'writerExecuted':writer.get('conclusion') not in (None,'skipped'),
            'verifiedPublicationCount':len(receipts),'scheduledExecutionObserved':context['event']=='schedule',
            'automaticPublicationVerified':context['event']=='schedule' and bool(receipts) and publish.get('conclusion')=='success'}

def record(state, receipt):
    state['lastExecution']=receipt
    history=state.setdefault('executionHistory',[])
    if not any(r['runUrl']==receipt['runUrl'] for r in history):history.append(receipt)
    previous=state.get('lastRun',{})
    current_id=receipt['runUrl'].rsplit('/',1)[-1]
    already_current=previous.get('runUrl')==receipt['runUrl'] or str(previous.get('owner','')).startswith(current_id+'-')
    if receipt['jobResult']!='success' and not already_current:
        state['lastWriterRun']=state.get('lastWriterRun') or previous
        state['lastRun']={'at':receipt['startedAt'] or receipt['checkedAt'],'trigger':receipt['event'],
                          'status':'writer-failed' if receipt['writerExecuted'] else 'prewriter-failed',
                          'error':' / '.join(receipt['failedSteps']) or 'Job infrastructure failed',
                          'runUrl':receipt['runUrl'],'nextAction':'Inspect this exact run failure; preserve browser QA, queue history and separate credential/media gates.'}
    return state

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):raise RuntimeError('Unexpected GitHub API redirect')

def main():
    repository=os.environ['GITHUB_REPOSITORY'];run=os.environ['GITHUB_RUN_ID']
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',repository) or not run.isdigit():raise ValueError('Invalid workflow context')
    url=f'https://api.github.com/repos/{repository}/actions/runs/{run}/jobs?per_page=100'
    req=urllib.request.Request(url,headers={'Authorization':'Bearer '+os.environ['GITHUB_TOKEN'],'Accept':'application/vnd.github+json'})
    with urllib.request.build_opener(NoRedirect()).open(req,timeout=30) as result:jobs=json.load(result)['jobs']
    path=pathlib.Path('operations/iam/state.json');state=json.loads(path.read_text())
    receipt=execution(jobs,state,{'runUrl':f'https://github.com/{repository}/actions/runs/{run}',
        'checkedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'event':os.environ['GITHUB_EVENT_NAME'],'jobResult':os.environ['IAM_JOB_RESULT']})
    record(state,receipt)
    readiness=assess(pathlib.Path.cwd())
    outbox=observe(state,readiness,receipt['checkedAt'])
    pathlib.Path('operations/iam/alert-outbox.json').write_text(json.dumps(outbox,indent=2)+'\n')
    pathlib.Path('operations/iam/readiness.json').write_text(json.dumps(readiness,indent=2)+'\n')
    path.write_text(json.dumps(state,indent=2)+'\n')
    public=pathlib.Path('artifacts/industry-army/public/iam-publishing-status.json')
    public.write_text(json.dumps({'schemaVersion':1,**receipt,'credentialAndMediaGates':'Independent requirements; successful infrastructure is not provider access or publication proof','independentAlertDeliveryVerified':False,'persistentOpenBlockers':len(outbox['issues']),'dependentExtensionsAllowed':readiness['dependentExtensionsAllowed']},indent=2)+'\n')
    subprocess.run(['git','config','user.name','IAM execution evidence'],check=True)
    subprocess.run(['git','config','user.email','iam-publisher@users.noreply.github.com'],check=True)
    subprocess.run(['git','add',str(path),str(public),'operations/iam/alert-outbox.json','operations/iam/readiness.json'],check=True)
    subprocess.run(['git','commit','-m','IAM: record actual remote execution including prewriter failures'],check=True)
    subprocess.run(['git','push','origin','HEAD:main'],check=True)
    print(json.dumps(receipt))

if __name__=='__main__':main()


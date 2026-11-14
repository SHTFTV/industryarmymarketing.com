"""Cheap read-only cadence poll; browser/model/deployment work runs only when needed."""
import datetime as dt
import json
import os
from pathlib import Path
from runtime import daily_due
from media_recovery import repaired_media

def should_execute(state,event,now,media=None,public_root=None):
    if event!='schedule':return True
    lease=state.get('lease')
    if lease and dt.datetime.fromisoformat(lease['until'].replace('Z','+00:00'))>now:return False
    last=state.get('lastVerifiedAt')
    if last and (now-dt.datetime.fromisoformat(last.replace('Z','+00:00'))).total_seconds()<3600:return False
    if daily_due(now,state):return True
    if media is not None and public_root is not None and repaired_media(state,media,public_root,now):return True
    return any(row.get('status') in ('pending','retry','claimed','verification-pending') and row.get('attempts',0)<3 for row in state.get('rows',{}).values())

if __name__=='__main__':
    state=json.loads(Path('operations/iam/state.json').read_text())
    media_path=Path('operations/iam/media.json')
    media=json.loads(media_path.read_text()) if media_path.exists() else {}
    due=should_execute(state,os.environ.get('GITHUB_EVENT_NAME','local'),dt.datetime.now(dt.timezone.utc),media,Path('artifacts/industry-army/public'))
    value='true' if due else 'false'
    with open(os.environ['GITHUB_OUTPUT'],'a') as output:output.write('executed='+value+'\n')
    with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as summary:
        summary.write('Publisher work eligible; live publication still requires its own receipt.\n' if due else 'Read-only cadence poll: no article claimed or published; browser, model and deploy work skipped.\n')
    print(json.dumps({'publisherWorkEligible':due,'publicationVerified':False,'minimumVerifiedReleaseSpacingSeconds':3600}))


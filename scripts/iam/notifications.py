"""Public-safe event trigger journal for the existing owner-configured Codex reader.

Queueing is never delivery. Only an independently observed same-event user report
may produce an opaque delivery receipt; private chat identifiers stay off GitHub.
"""
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import subprocess
from prebuild import rules

JOURNAL='operations/iam/notifications.json'

def notice_id(kind,key):
    return 'iam-notice-'+hashlib.sha256((kind+'\n'+key).encode()).hexdigest()[:20]

def reconcile(state,journal,now):
    journal=journal or {'schemaVersion':1,'site':'industryarmymarketing.com','route':'owner-configured-codex-relay','events':[]}
    events={e['eventId']:e for e in journal['events']};active=set()
    def put(kind,key,fields):
        event_id=notice_id(kind,key);active.add(event_id)
        if event_id not in events:
            events[event_id]={'eventId':event_id,'kind':kind,'lifecycle':'open','deliveryStatus':'queued','triggeredAt':now,
                              'deliveryAttempts':0,'deliveryReceipt':None,**fields}
        return event_id
    rows=state.get('rows',{})
    checks=('http','canonical','schema','discovery','desktop','phone','image')
    verified=sorted(((slug,row) for slug,row in rows.items() if row.get('status')=='verified' and row.get('verifiedAt') and all(row.get('evidence',{}).get(k) is True for k in checks)),key=lambda x:x[1]['verifiedAt'])
    for slug,row in verified:
        url=row.get('canonical','https://www.industryarmymarketing.com/blog/'+slug)
        proof=row.get('evidence',{})
        put('publication_verified',url,{'siteDomain':row.get('sourceDomain','industryarmymarketing.com'),'articleSlug':slug,'articleUrl':url,
            'status':'verified','verifiedAt':row['verifiedAt'],'reconciled':(dt.datetime.fromisoformat(now.replace('Z','+00:00'))-dt.datetime.fromisoformat(row['verifiedAt'].replace('Z','+00:00'))).total_seconds()>300,'summary':row.get('sourceDomain',slug)+' IAM article is verified live.',
            'nextAction':'Read the verified article; no publication retry is needed.',
            'proof':{'runUrl':proof.get('runUrl'),'publicationVerified':True,'generatedAndAudited':proof.get('generatedAndAudited',False)}})
    for slug,row in rows.items():
        if row.get('status')!='blocked':continue
        text=(row.get('nextAction','')+' '+row.get('stage','')).lower()
        code='media_review_missing' if 'media' in text or 'image' in text else 'approval_required' if 'approv' in text else 'item_blocked'
        kind='approval_required' if code=='approval_required' else 'publishing_blocked'
        action='Review the exact company image and provenance for this item; other eligible items can continue.' if code=='media_review_missing' else 'Review this exact item in the approved owner channel; do not reset its attempt history.'
        put(kind,slug+':'+code,{'siteDomain':row.get('sourceDomain','industryarmymarketing.com'),'articleSlug':slug,'status':'blocked',
            'reasonCode':code,'summary':row.get('sourceDomain',slug)+' publishing item remains blocked.','nextAction':action,
            'proof':{'blockedAt':row.get('blockedAt'),'attempts':row.get('attempts')}})
    run=state.get('lastRun',{})
    if run.get('status') in ('failed','prewriter-failed','writer-failed'):
        run_url=run.get('runUrl') or str(run.get('owner','')).split('-')[0]
        put('publishing_failure',str(run_url),{'siteDomain':'industryarmymarketing.com','status':'failed',
            'reasonCode':'publisher_run_failed','summary':'IAM cloud publication run failed; a green wrapper is not publication proof.',
            'nextAction':'Inspect the exact retained run and issue; continue independent eligible work.','proof':{'runUrl':run_url}})
    pending=[slug for slug,row in rows.items() if '-welcome-' in slug and row.get('status') in ('pending','retry','claimed')]
    last=state.get('lastVerifiedAt')
    if pending and last:
        eligible=dt.datetime.fromisoformat(last.replace('Z','+00:00'))+dt.timedelta(seconds=3600)
        if dt.datetime.fromisoformat(now.replace('Z','+00:00'))<eligible:
            put('spacing_hold','|'.join(sorted(pending))+':'+last,{'siteDomain':'industryarmymarketing.com','status':'held',
                'articleSlugs':sorted(pending),'eligibleAfter':eligible.isoformat(),'reasonCode':'required_one_hour_release_gap',
                'summary':'Authorized IAM welcome publication is waiting for the one-hour verified-release gap.',
                'nextAction':'The existing sole publisher resumes when eligible; no new approval is required.'})
    for event in events.values():
        if event['eventId'] not in active and event.get('lifecycle')=='open' and event['kind']!='publication_verified':
            event.update(lifecycle='resolved',resolvedAt=now)
            if event['deliveryStatus'] in ('queued','retry'):event['deliveryStatus']='superseded'
    journal['events']=list(events.values())
    return journal

def apply_receipts(journal,receipts):
    events={event['eventId']:event for event in journal['events']}
    for receipt in receipts:
        event=events.get(receipt.get('eventId'))
        if event and receipt.get('kind')=='observed_delivery_attempt':
            attempt=receipt.get('attemptDigest','')
            if len(attempt)!=64 or any(c not in '0123456789abcdef' for c in attempt):raise ValueError('Actual delivery attempt proof required')
            observed=dt.datetime.fromisoformat(receipt['attemptedAt'].replace('Z','+00:00'))
            prior=event.setdefault('deliveryAttemptReceipts',[])
            if attempt not in prior:
                prior.append(attempt);event['deliveryAttempts']=len(prior)
                event['deliveryStatus']='retry' if len(prior)<3 else 'blocked_delivery'
                event['nextDeliveryAttemptAt']=(observed+dt.timedelta(seconds=min(1800,300*2**(len(prior)-1)))).isoformat()
                event['deliveryNextAction']='Retry the same event through the configured reader after backoff.' if len(prior)<3 else 'Review the exact relay failure before an explicit same-event recovery.'
            continue
        digest=receipt.get('reportDigest','')
        if not event or receipt.get('kind')!='observed_user_report' or len(digest)!=64 or not all(c in '0123456789abcdef' for c in digest):
            raise ValueError('Actual same-event user report proof required')
        dt.datetime.fromisoformat(receipt['deliveredAt'].replace('Z','+00:00'))
        event.update(deliveryStatus='delivered',deliveryReceipt={'kind':'observed_user_report','reportDigest':digest,'deliveredAt':receipt['deliveredAt']})
        event.pop('nextDeliveryAttemptAt',None)
    return journal

def main():
    loaded=rules(Path.cwd(),remote=os.environ.get('GITHUB_ACTIONS')=='true')
    path=Path(JOURNAL);state=json.loads(Path('operations/iam/state.json').read_text())
    old=json.loads(path.read_text()) if path.exists() else None
    before=json.dumps(old,sort_keys=True)
    value=reconcile(state,old,dt.datetime.now(dt.timezone.utc).isoformat())
    receipts=Path('operations/iam/notification-deliveries.json')
    if receipts.exists():apply_receipts(value,json.loads(receipts.read_text()).get('receipts',[]))
    if json.dumps(value,sort_keys=True)!=before or value.get('producer',{}).get('stage')!='fired':
        value['producer']={'stage':'fired','firedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'runUrl':os.environ.get('IAM_RUN_URL'),'rules':loaded}
    path.write_text(json.dumps(value,indent=2)+'\n')
    git=['git','-c','safe.directory='+str(Path.cwd())]
    subprocess.run(git+['config','user.name','IAM notification trigger'],check=True)
    subprocess.run(git+['config','user.email','iam-publisher@users.noreply.github.com'],check=True)
    subprocess.run(git+['add',JOURNAL],check=True)
    changed=subprocess.check_output(git+['diff','--cached','--name-only'],text=True).strip()
    if changed:
        subprocess.run(git+['commit','-m','IAM: retain deduplicated owner notification triggers and actual delivery receipts'],check=True)
        subprocess.run(git+['push','origin','HEAD:main'],check=True)
    print(json.dumps({'triggerFired':True,'events':len(value['events']),'queued':sum(e['deliveryStatus']=='queued' for e in value['events']),
                      'delivered':sum(e['deliveryStatus']=='delivered' for e in value['events']),
                      'route':'owner-configured-codex-relay','queueIsDelivery':False}))

if __name__=='__main__':main()

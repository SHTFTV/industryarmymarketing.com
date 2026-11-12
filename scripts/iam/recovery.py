"""Bounded recovery and durable item/source failure isolation for the existing writer."""
import datetime as dt
import urllib.error

class ItemHold(RuntimeError):
    def __init__(self,slug):self.slug=slug;super().__init__('Item held: '+slug)

def eligible(row,now):
    if row.get('attempts',0)>=3:return False
    if row.get('status') not in ('pending','retry','verification-pending'):return False
    value=row.get('nextRetryAt')
    return not value or dt.datetime.fromisoformat(value.replace('Z','+00:00'))<=now

def recover_expired(state,journal,now):
    lease=state.get('lease')
    if lease and dt.datetime.fromisoformat(lease['until'])>now:return
    existing={p['slug'] for p in journal}
    for slug,row in state.get('rows',{}).items():
        if row.get('status')=='claimed':
            row.update(status='verification-pending' if slug in existing else 'retry',recoveryReason='Expired lease; existing canonical checked before any retry',recoveredAt=now.isoformat())
            row.setdefault('attemptHistory',[]).append({'status':'interrupted','at':now.isoformat(),'previousOwner':row.get('owner')})
    if lease:state.pop('lease',None)

def fetch_all(urls,fetch):
    sources=[];failures=[]
    for url in urls[:3]:
        try:sources.append(fetch(url))
        except Exception as error:failures.append({'url':url,'errorType':type(error).__name__,'httpStatus':getattr(error,'code',None)})
    return sources,failures

def retain_failure(state,slug,stage,error,now,published=False):
    row=state['rows'][slug]
    transient=isinstance(error,(urllib.error.URLError,TimeoutError,ConnectionError))
    status='verification-pending' if published else 'retry' if transient and row['attempts']<3 else 'blocked'
    # No provider body, authorization header or environment values are serialized.
    reason=str(error)[:250] if isinstance(error,ValueError) else type(error).__name__
    receipt={'slug':slug,'at':now.isoformat(),'stage':stage,'status':status,'errorType':type(error).__name__,
             'reason':reason,'httpStatus':getattr(error,'code',None),'attempt':row['attempts'],'rules':state.get('loadedRules')}
    row.update(status=status,stage=stage,nextAction=reason,lastFailure=receipt)
    if status in ('retry','verification-pending'):row['nextRetryAt']=(now+dt.timedelta(seconds=min(1800,300*2**max(0,row['attempts']-1)))).isoformat()
    state.setdefault('attemptReceipts',[]).append(receipt)
    issue_id='iam:'+slug+':'+stage
    state.setdefault('persistentBlockers',{})[issue_id]={'id':issue_id,'slug':slug,'status':'open','reason':reason,'stage':stage,'lastSeenAt':now.isoformat(),'delivery':'unproven'}
    state.pop('lease',None)
    return receipt

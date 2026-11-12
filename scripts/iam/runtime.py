"""IAM's bounded cloud queue. No customer evidence or credentials in receipts."""
import datetime as dt
import hashlib
import json
import os
import pathlib
from zoneinfo import ZoneInfo

UTC = dt.timezone.utc

def stamp():
    return dt.datetime.now(UTC).isoformat()

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()

def read(path):
    return json.loads(pathlib.Path(path).read_text())

def save(path, value):
    target = pathlib.Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix('.tmp')
    temporary.write_text(json.dumps(value, indent=2) + '\n')
    temporary.replace(target)

def reconcile(state, journal, baseline):
    """Observe existing history; never reset a claimed, failed or withdrawn row."""
    state.setdefault('rows', {})
    state.setdefault('receipts', [])
    existing = {p['slug']: p for p in journal}
    for article in baseline['articles']:
        slug = article['slug']
        if slug in state['rows']:
            continue
        status = 'withdrawn' if article['stage'] == 'withdrawn' else 'existing-publication' if slug in existing else 'pending'
        state['rows'][slug] = {'status': status, 'attempts': 0, 'sourceDomain': article['siteDomain'], 'canonical': article['canonical'], 'observedAt': stamp(), 'basis': 'versioned historical queue and current repository journal; not recovery of missing SQLite'}
    return state

def claim(state, slug, owner, now):
    row = state['rows'][slug]
    lease = state.get('lease')
    if lease and dt.datetime.fromisoformat(lease['until']) > now and lease['owner'] != owner:
        raise ValueError('Active IAM global writer lease')
    if row['status'] not in ('pending', 'retry'):
        raise ValueError('Row is not eligible for claim')
    if row['attempts'] >= 3:
        raise ValueError('Three attempts exhausted; explicit recovery required')
    last = state.get('lastVerifiedAt')
    if last and (now - dt.datetime.fromisoformat(last)).total_seconds() < 3600:
        raise ValueError('At least 3600 seconds since verified publication required')
    state['lease'] = {'owner': owner, 'until': (now + dt.timedelta(minutes=30)).isoformat()}
    row.update(status='claimed', owner=owner, attempts=row['attempts'] + 1)
    row.setdefault('attemptHistory',[]).append({'attempt':row['attempts'],'owner':owner,'at':now.isoformat(),'rules':state.get('loadedRules')})
    return row

def renew(state, owner, now):
    lease = state.get('lease')
    if not lease or lease['owner'] != owner or dt.datetime.fromisoformat(lease['until']) <= now:
        raise ValueError('Exact active owner lease required')
    lease['until'] = (now + dt.timedelta(minutes=30)).isoformat()

def complete(state, slug, owner, evidence, now):
    renew(state, owner, now)
    row = state['rows'][slug]
    required = ('http', 'canonical', 'schema', 'discovery', 'desktop', 'phone', 'image')
    if row['status'] != 'claimed' or row['owner'] != owner or not all(evidence.get(k) is True for k in required):
        raise ValueError('Complete live evidence and exact claim required')
    row.update(status='verified', stage='verified', verifiedAt=now.isoformat(), evidence=evidence,nextAction='Verified; prior attempt evidence retained')
    row.pop('nextRetryAt',None)
    state['lastVerifiedAt'] = now.isoformat()
    state['receipts'].append({'slug': slug, 'verifiedAt': now.isoformat(), 'runUrl': evidence['runUrl'], 'trigger': evidence['trigger'],'generatedAndAudited':evidence.get('generatedAndAudited',False),'productionVerified':True,'rules':evidence.get('rules')})
    for issue in state.get('persistentBlockers',{}).values():
        if issue.get('slug')==slug and issue.get('kind')!='source-feed' and issue.get('status')=='open':issue.update(status='resolved',resolvedAt=now.isoformat(),resolution='Exact canonical verified')
    state.pop('lease', None)

def daily_due(now, state):
    local = now.astimezone(ZoneInfo('America/Vancouver'))
    return local.hour == 20 and local.minute >= 30 and state.get('dailyJournalDate') != local.date().isoformat()

def block(state, slug, owner, stage, action):
    row = state['rows'][slug]
    if row.get('owner') != owner:
        raise ValueError('Exact claim owner required')
    row.update(status='blocked', blockedAt=stamp(), stage=stage, nextAction=action)
    state.pop('lease', None)

def policy_context(policy, evidence):
    # Untrusted source text is a separate data item, never instructions/policy.
    return {'policy': policy, 'policyDigest': digest(policy), 'sourceEvidence': evidence}


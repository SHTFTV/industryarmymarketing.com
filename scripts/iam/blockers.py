"""Site-local persistent issues/outbox; delivery remains explicitly unproven."""
import hashlib

def observe(state,evaluation,now):
    issues=state.setdefault('persistentBlockers',{})
    current=set()
    for reason in evaluation['blockers']:
        key='iam:prebuild:'+hashlib.sha256(reason.encode()).hexdigest()[:16];current.add(key)
        item=issues.setdefault(key,{'id':key,'kind':'prebuild','firstSeenAt':now,'delivery':'unproven'})
        item.update(status='open',lastSeenAt=now,reason=reason)
    for key,item in issues.items():
        if item.get('kind')=='prebuild' and key not in current and item.get('status')=='open':
            item.update(status='resolved',resolvedAt=now,resolution='Required measured gate now passes')
    return {'schemaVersion':1,'site':'industryarmymarketing.com','checkedAt':now,
            'deliveryVerified':False,'adapter':'shared-owner-interface-pending',
            'issues':[v for v in issues.values() if v.get('status')=='open']}

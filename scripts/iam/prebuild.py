"""Measured prerequisite gate; never disables already authorized independent service."""
import datetime as dt
import hashlib
import json
import pathlib
import subprocess
import sys

def rules(root, remote=False):
    root=pathlib.Path(root)
    paths=['docs/IAM-SOT.md','operations/iam/policy.json','operations/iam/build-contract.json']
    hashes={p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in paths}
    if remote:
        subprocess.run(['git','-c','safe.directory='+str(root),'fetch','--quiet','origin','main'],cwd=root,check=True,timeout=60)
        for path in paths:
            raw=subprocess.check_output(['git','-c','safe.directory='+str(root),'show','origin/main:'+path],cwd=root,timeout=30)
            if hashlib.sha256(raw).hexdigest()!=hashes[path]:raise RuntimeError('Canonical SOT changed; discard stale attempt')
    try:commit=subprocess.check_output(['git','-c','safe.directory='+str(root),'rev-parse','HEAD'],cwd=root,stderr=subprocess.DEVNULL,text=True).strip()
    except subprocess.CalledProcessError:commit='local-test-unversioned'
    return {'sourceCommit':commit,'hashes':hashes,'sotVersion':2}

def assess(root,now=None):
    root=pathlib.Path(root);now=now or dt.datetime.now(dt.timezone.utc)
    def read(name):
        p=root/'operations/iam'/name
        return json.loads(p.read_text()) if p.exists() else {}
    access=read('writer-access.json');production=read('source-production.json');state=read('state.json');contract=read('build-contract.json')
    blockers=[]
    try:loaded=rules(root)
    except (OSError,ValueError):loaded=None;blockers.append('Canonical SOT/build contract missing or unreadable')
    for value,label in [(production,'Source-to-production'),(access,'Required writing-service access')]:
        try:fresh=(now-dt.datetime.fromisoformat(value['checkedAt'].replace('Z','+00:00'))).total_seconds()<86400
        except (KeyError,ValueError,TypeError):fresh=False
        bound=bool(loaded) and (value.get('rules',{}).get('hashes')==loaded['hashes'] if label=='Required writing-service access' else value.get('production',{}).get('sotSha256')==loaded['hashes']['docs/IAM-SOT.md'])
        passed=(value.get('status')=='verified' or value.get('runtimeAccessVerified') is True) if label=='Required writing-service access' else value.get('status')=='verified'
        if not passed or not fresh or not bound:blockers.append(label+' lacks a fresh real runtime receipt')
    if access.get('errorType') in ('editorial-audit','draft-validation'):blockers.append('Prepared launch validation failed: '+str(access.get('targetSlug','runtime probe'))+' — '+str(access.get('reason','unknown')))
    if not any(r.get('generatedAndAudited') and r.get('productionVerified') for r in state.get('receipts',[])):
        blockers.append('Minimal generated-and-audited production publication has not been verified')
    if not any(r.get('trigger')=='schedule' and r.get('generatedAndAudited') and r.get('productionVerified') for r in state.get('receipts',[])):
        blockers.append('Native scheduled generated publication not yet proven')
    recovery=read('recovery-acceptance.json')
    if recovery.get('status')!='verified':blockers.append('Live failure-isolation and recovery acceptance not yet proven; local tests are separate')
    if not contract.get('sharedStandard',{}).get('verifiedInterface'):blockers.append('Shared operating-standard v2 interface not yet verified/pinned')
    if contract.get('alertDelivery',{}).get('status')!='verified':blockers.append('Persistent blocker notification delivery unproven')
    return {'checkedAt':now.isoformat(),'dependentExtensionsAllowed':not blockers,'operationallyComplete':not blockers,'blockers':blockers}

if __name__=='__main__':
    root=pathlib.Path.cwd();result=assess(root);print(json.dumps(result,indent=2))
    if '--require-ready' in sys.argv and not result['dependentExtensionsAllowed']:raise SystemExit(1)

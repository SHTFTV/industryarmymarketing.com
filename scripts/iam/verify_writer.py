"""Two bounded real provider calls using IAM's installed runtime access; no secret output."""
import datetime as dt
import hashlib
import json
import os
import pathlib
import urllib.error
from runtime import read, save, policy_context, digest
from source import fetch_source
from writer import write_article, EditorialAuditError, DraftValidationError
from prebuild import rules
from approved_launches import pending_launches, source_checked_post
from recovery import fetch_all

def main():
    root=pathlib.Path.cwd();now=dt.datetime.now(dt.timezone.utc)
    receipt={'checkedAt':now.isoformat(),'status':'blocked','configured':bool(os.environ.get('OPENAI_API_KEY')),
             'modelConfigured':bool(os.environ.get('OPENAI_MODEL')),'model':os.environ.get('OPENAI_MODEL'),
             'credentialsRecorded':False,'runtimeAccessVerified':False,'maximumProviderCalls':2,'published':False,'runUrl':os.environ.get('IAM_RUN_URL')}
    try:
        receipt['rules']=rules(root,remote=os.environ.get('GITHUB_ACTIONS')=='true')
        state=read('operations/iam/state.json');journal=read('artifacts/industry-army/src/data/buildJournal.json')
        launches=pending_launches(root,state,journal)
        target=next((a for a in launches if a.get('generateAndAudit')),None)
        old=root/'operations/iam/writer-access.json'
        if old.exists():
            prior=json.loads(old.read_text())
            age=(now-dt.datetime.fromisoformat(prior['checkedAt'])).total_seconds()
            if prior.get('status')=='verified' and age<86400 and prior.get('model')==receipt['model'] and prior.get('rules',{}).get('hashes')==receipt['rules']['hashes'] and (not target or prior.get('targetSlug')==target['slug']):
                print('Existing fresh measured IAM generation/audit receipt retained');return
        if not receipt['configured']:raise RuntimeError('IAM_OPENAI_KEY_MISSING')
        if not receipt['modelConfigured']:raise RuntimeError('IAM_OPENAI_MODEL_MISSING')
        sources,failures=fetch_all(target['primarySources'] if target else ['https://irrigation.ltd/'],fetch_source)
        if not sources:raise RuntimeError('All assigned preparation sources failed')
        source=sources[0]
        context=policy_context(read('operations/iam/policy.json'),sources)
        context['policy']={**context['policy'],'canonicalSot':(root/'docs/IAM-SOT.md').read_text()}
        context.update(intent='A private runtime proof explaining the actual Irrigation.ltd launch and its planning purpose; no claim that unpublished services operate',existingTitles=[],siteDomain='irrigation.ltd')
        if target:
            template=source_checked_post(target,sources)
            context.update(intent='Welcome '+target['siteDomain']+' as a new IAM network site; describe its actual launch purpose and features with the verified parent brand',siteDomain=target['siteDomain'],requiredTitle=template['title'],requiredBrandStatement=target.get('requiredBrandStatement'))
            context['policy']['ownerAuthorizedLaunch']={'site':target['siteDomain'],'title':template['title'],'relationship':target.get('requiredBrandStatement')}
            receipt.update(targetSlug=target['slug'],templateDigest=digest(target['approvedPost']))
        receipt.update(sourceUrl=source['url'],sourceSha256=source['sha256'],sourceHashes={s['url']:s['sha256'] for s in sources},sourceFailures=failures)
        article=write_article(context)
        save('operations/iam/runtime-probe-draft.json',article)
        receipt.update(status='verified',runtimeAccessVerified=True,generationAndIndependentAuditPassed=True,sourceUrl=source['url'],sourceSha256=source['sha256'],
                       draftSha256=hashlib.sha256(json.dumps(article,sort_keys=True).encode()).hexdigest(),maximumProviderCalls=2,sourceHashes={s['url']:s['sha256'] for s in sources},sourceFailures=failures)
    except (EditorialAuditError,DraftValidationError) as error:
        save('operations/iam/rejected-probe-draft.json',{'article':error.article,'auditIssues':error.issues,'checkedAt':receipt['checkedAt']})
        receipt.update(reason=str(error),runtimeAccessVerified=True,generationAndIndependentAuditPassed=False,auditIssues=error.issues,errorType='editorial-audit' if isinstance(error,EditorialAuditError) else 'draft-validation')
    except urllib.error.HTTPError as error:receipt.update(reason='Provider rejected the real runtime request',httpStatus=error.code,errorType='provider-http')
    except Exception as error:receipt.update(reason=str(error)[:250] if isinstance(error,(ValueError,RuntimeError)) else type(error).__name__,errorType=type(error).__name__)
    save('operations/iam/writer-access.json',receipt)
    print(json.dumps(receipt,indent=2))
    if receipt['status']!='verified':raise SystemExit(1)

if __name__=='__main__':main()

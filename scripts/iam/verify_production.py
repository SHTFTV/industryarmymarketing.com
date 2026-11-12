"""Compare actual production build provenance with this canonical journal source."""
import datetime as dt
import hashlib
import json
import os
import pathlib
import time
import urllib.request
from runtime import save

def main():
    root=pathlib.Path.cwd();path='artifacts/industry-army/src/data/buildJournal.json'
    expected=hashlib.sha256((root/path).read_bytes()).hexdigest()
    receipt={'checkedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'status':'blocked','runUrl':os.environ.get('IAM_RUN_URL'),
             'url':'https://www.industryarmymarketing.com/source-version.json','expectedJournalSha256':expected}
    for attempt in range(25):
        try:
            request=urllib.request.Request(receipt['url'],headers={'Cache-Control':'no-cache'})
            with urllib.request.urlopen(request,timeout=15) as response:actual=json.load(response)
            if actual.get('repository')!='SHTFTV/industryarmymarketing.com' or actual.get('journalSha256')!=expected or actual.get('sotSha256')!=hashlib.sha256((root/'docs/IAM-SOT.md').read_bytes()).hexdigest() or not actual.get('sourceCommit'):
                raise ValueError('Production does not yet expose matching canonical source provenance')
            receipt.update(status='verified',production=actual);break
        except Exception as error:
            receipt.update(reason=type(error).__name__)
            if attempt<24:time.sleep(5)
    save('operations/iam/source-production.json',receipt);print(json.dumps(receipt,indent=2))
    if receipt['status']!='verified':raise SystemExit(1)

if __name__=='__main__':main()

"""Reuse a real audited launch draft only under the exact source, rules and template."""
import copy
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
from prebuild import rules
from runtime import digest

def prepared_draft(root,article,sources):
    root=Path(root)
    try:
        receipt=json.loads((root/'operations/iam/writer-access.json').read_text())
        if receipt.get('status')!='verified' or receipt.get('generationAndIndependentAuditPassed') is not True or receipt.get('targetSlug')!=article['slug']:return None
        if receipt.get('model')!=os.environ.get('OPENAI_MODEL'):return None
        if receipt.get('rules',{}).get('hashes')!=rules(root)['hashes']:return None
        if receipt.get('sourceHashes')!={s['url']:s['sha256'] for s in sources}:return None
        if receipt.get('templateDigest')!=digest(article['approvedPost']):return None
        if (dt.datetime.now(dt.timezone.utc)-dt.datetime.fromisoformat(receipt['checkedAt'])).total_seconds()>=86400:return None
        article_json=json.loads((root/'operations/iam/runtime-probe-draft.json').read_text())
        if hashlib.sha256(json.dumps(article_json,sort_keys=True).encode()).hexdigest()!=receipt.get('draftSha256'):return None
        return copy.deepcopy(article_json)
    except (KeyError,ValueError,OSError,TypeError):return None

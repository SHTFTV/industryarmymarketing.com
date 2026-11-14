"""Reconsider a media hold only when new, reviewed source-photo bytes repair it.

The cheap scheduler can inspect this without a model, browser or publication.
Attempts, old failures and unresolved alerts are retained until live verification.
"""
import datetime as dt
import hashlib
import json
from pathlib import Path
from urllib.parse import urlsplit


def repaired_media(state, media, public_root, now):
    lease = state.get('lease')
    if lease and dt.datetime.fromisoformat(lease['until'].replace('Z', '+00:00')) > now:
        return {}
    root = Path(public_root).resolve()
    repairs = {}
    for slug, row in state.get('rows', {}).items():
        if row.get('status') != 'blocked' or row.get('stage') != 'media' or row.get('attempts', 0) >= 3:
            continue
        item = media.get(slug)
        if not isinstance(item, dict):
            continue
        valid = True
        for kind in ('hero', 'share'):
            asset = item.get(kind, {})
            review = asset.get('visualApproval', {})
            source = urlsplit(asset.get('sourceUrl', ''))
            domain = row.get('sourceDomain', '').removeprefix('www.')
            try:
                path = (root / asset['path'].lstrip('/')).resolve()
                valid = valid and path.is_relative_to(root) and path.is_file()
                valid = valid and hashlib.sha256(path.read_bytes()).hexdigest() == asset['sha256']
                valid = valid and asset.get('mediaType') == 'source-photograph'
                valid = valid and source.scheme == 'https' and source.hostname.removeprefix('www.') == domain
                valid = valid and all(asset.get(k) for k in ('credit', 'rightsEvidence', 'visualReview'))
                valid = valid and asset.get('upscaled') is False and asset['nativeSize'][0] >= 1600 and asset['nativeSize'][1] >= 900
                valid = valid and review.get('status') == 'passed' and review.get('sha256') == asset['sha256']
                valid = valid and all(review.get(k) for k in ('desktopEvidence', 'phoneEvidence', 'reviewedAt'))
            except (KeyError, TypeError, AttributeError, OSError, ValueError):
                valid = False
        fingerprint = hashlib.sha256(json.dumps(item, sort_keys=True).encode()).hexdigest()
        if valid and row.get('mediaRepairDigest') != fingerprint:
            repairs[slug] = fingerprint
    return repairs


def recover_reviewed_media(state, media, public_root, now):
    repairs = repaired_media(state, media, public_root, now)
    for slug, fingerprint in repairs.items():
        row = state['rows'][slug]
        receipt = {'at': now.isoformat(), 'status': 'retry', 'reason': 'Exact source photograph, byte hash and desktop/phone review now repair the retained media hold', 'previousFailure': row.get('lastFailure'), 'mediaRepairDigest': fingerprint}
        row.update(status='retry', mediaRepairDigest=fingerprint, nextAction=receipt['reason'])
        row.pop('nextRetryAt', None)
        row.setdefault('mediaRepairHistory', []).append(receipt)
    return repairs

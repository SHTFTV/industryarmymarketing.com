"""Exact user-authorized launch manuscripts consumed by IAM's existing sole writer."""
import copy
import hashlib
import json
import re
from pathlib import Path

def pending_launches(root, state, journal):
    root = Path(root)
    manifest = root / 'operations/iam/approved-launches.json'
    if not manifest.exists():
        return []
    published = {p['slug'] for p in journal}
    pending = []
    issues = []
    seen = set()
    for entry in json.loads(manifest.read_text()).get('releases', []):
        slug = entry.get('slug', '')
        try:
            if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug):
                raise ValueError('Invalid launch slug')
            if slug in seen:
                raise ValueError('Duplicate launch entry')
            seen.add(slug)
            if slug in published:
                continue
            row = state.get('rows', {}).get(slug)
            if row and row.get('status') not in ('pending', 'retry'):
                continue
            if entry.get('kind') != 'user-authorized-launch' or not entry.get('authorization') or entry.get('reviewed') is not True:
                raise ValueError('Exact launch authorization and completed editorial review required')
            path = root / 'operations/iam/approved-launches' / (slug + '.json')
            raw = path.read_bytes()
            if hashlib.sha256(raw).hexdigest() != entry.get('postSha256'):
                raise ValueError('Manuscript changed after review')
            post = json.loads(raw)
            domain = entry['sourceDomain']
            if post.get('slug') != slug or post.get('campaignSite') != domain:
                raise ValueError('Manuscript identity mismatch')
            for key in ('title', 'excerpt', 'metaDescription', 'image', 'ogImage', 'imageAlt', 'richContent', 'cta'):
                if not post.get(key):
                    raise ValueError('Incomplete reviewed manuscript: ' + key)
            text = json.dumps(post['richContent'], ensure_ascii=False)
            if entry['parentBrand'] not in text or 'Industry Army Marketing' not in text:
                raise ValueError('Approved brand relationship missing')
            urls = entry.get('sourceUrls', [])
            if not urls or any(not u.startswith('https://' + domain + '/') for u in urls):
                raise ValueError('Exact site primary source URLs required')
            state.setdefault('rows', {}).setdefault(slug, {
                'status': 'pending', 'attempts': 0, 'sourceDomain': domain,
                'canonical': 'https://www.industryarmymarketing.com/blog/' + slug,
                'basis': 'Explicit user-authorized launch; reviewed exact manuscript, existing shared writer'
            })
            pending.append({'slug': slug, 'siteDomain': domain, 'intent': post.get('campaignLabel', 'Network launch'),
                            'primarySources': urls, 'approvedPost': copy.deepcopy(post),
                            'requiredSourceText': entry.get('requiredSourceText', []),
                            'requiredContact': post['cta']['buttonHref']})
        except (ValueError, KeyError, OSError, TypeError) as error:
            issues.append({'slug': slug, 'status': 'held', 'reason': str(error)[:250]})
    state['approvedLaunchIssues'] = issues
    return pending

def source_checked_post(article, sources):
    text = ' '.join(source['text'] for source in sources).casefold()
    if any(value.casefold() not in text for value in article.get('requiredSourceText', [])):
        raise ValueError('Live source no longer matches the approved launch identity')
    return copy.deepcopy(article['approvedPost'])

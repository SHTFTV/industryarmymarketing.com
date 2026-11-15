"""Read-only media contracts and a complete journal inventory, including legacy posts.

The queue's publication status never exempts an image from inspection. Mechanical
checks do not create a visual approval; source and production reviews stay separate.
"""
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

from runtime import digest

JOURNAL = 'artifacts/industry-army/src/data/buildJournal.json'
PUBLIC = 'artifacts/industry-army/public'
CONFIG = 'operations/iam/media-contract.json'


def local_asset(root, path):
    public = (Path(root) / PUBLIC).resolve()
    if not isinstance(path, str) or not path.startswith('/') or urlsplit(path).netloc:
        raise ValueError('An exact local public asset path is required')
    asset = (public / path.lstrip('/')).resolve()
    if not asset.is_relative_to(public):
        raise ValueError('Media path escapes public root')
    return asset


def inspect_asset(root, path):
    from PIL import Image
    asset = local_asset(root, path)
    data = asset.read_bytes()
    result = {'path': path, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
    if asset.suffix.lower() == '.svg':
        text = data.decode()
        size = re.search(r'<svg\b[^>]*\bwidth=["\']([0-9.]+)["\'][^>]*\bheight=["\']([0-9.]+)', text)
        result.update(format='SVG', size=[float(size[1]), float(size[2])] if size else None)
    else:
        with Image.open(asset) as image:
            image.load()
            result.update(format=image.format, size=list(image.size))
    return result


def reviewed(review, asset_sha, post_sha):
    return (isinstance(review, dict) and review.get('status') == 'passed'
            and review.get('sha256') == asset_sha and review.get('postSha256') == post_sha
            and all(review.get(k) for k in ('reviewedAt', 'desktopEvidence', 'phoneEvidence')))


def production_reviewed(review, asset_sha, post_sha, canonical):
    if not reviewed(review, asset_sha, post_sha):
        return False
    desktop, phone = review.get('desktopViewport'), review.get('phoneViewport')
    def viewport(value):
        return isinstance(value, list) and len(value) == 2 and all(isinstance(n, int) for n in value)
    return (review.get('reviewKind') == 'production-page' and review.get('canonical') == canonical
            and re.fullmatch(r'[0-9a-f]{40}', review.get('deploymentSourceCommit', '')) is not None
            and viewport(desktop) and desktop[0] >= 1024 and desktop[1] >= 700
            and viewport(phone) and 320 <= phone[0] <= 480 and phone[1] >= 600)


def validate_contract(root, post, entry):
    if not isinstance(entry, dict) or entry.get('contractVersion') != 2:
        raise ValueError('Published article lacks its required version2 media registry contract')
    if entry.get('disallowInlineMedia') and any(section.get('image') for section in post.get('richContent', {}).get('sections', [])):
        raise ValueError('Article contract disallows unreviewed decorative inline media')
    post_sha = digest(post)
    bindings = {}
    for kind, post_key in (('hero', 'image'), ('share', 'ogImage')):
        asset = entry.get(kind, {})
        if asset.get('path') != post.get(post_key):
            raise ValueError(kind + ' differs from the canonical journal')
        actual = inspect_asset(root, asset['path'])
        if actual['format'] not in ('JPEG', 'PNG', 'WEBP') or actual['size'] != [1600, 900]:
            raise ValueError(kind + ' must decode as a real1600x900 raster photograph')
        if actual['sha256'] != asset.get('sha256'):
            raise ValueError(kind + ' bytes changed after review')
        if asset.get('mediaType') != 'source-photograph' or asset.get('upscaled') is not False:
            raise ValueError(kind + ' is not declared original source photography without upscaling')
        native = asset.get('nativeSize', [0, 0])
        if len(native) != 2 or native[0] < 1600 or native[1] < 900:
            raise ValueError(kind + ' original resolution is insufficient')
        if urlsplit(asset.get('sourceUrl', '')).scheme != 'https' or not all(asset.get(k) for k in ('credit', 'rightsEvidence', 'visualReview')):
            raise ValueError(kind + ' lacks exact source, credit, rights or review evidence')
        if not reviewed(asset.get('visualApproval'), actual['sha256'], post_sha):
            raise ValueError(kind + ' lacks an actual source review bound to both photo and article hashes')
        production = asset.get('productionReview', {})
        bindings[kind] = dict(actual, postSha256=post_sha,
                              sourceReviewStatus='passed',
                              productionReviewStatus='passed' if production_reviewed(production, actual['sha256'], post_sha, 'https://www.industryarmymarketing.com/blog/' + post['slug']) else 'review-pending')
    return bindings


def coverage(root, journal, registry, config):
    posts = {post['slug']: post for post in journal}
    required = set(config['requiredPosts'])
    required.update(post['slug'] for post in journal if post.get('mediaContractVersion') == 2)
    checked, errors = {}, []
    for slug in sorted(required):
        try:
            if slug not in posts:
                raise ValueError('Required published article missing from journal')
            checked[slug] = validate_contract(root, posts[slug], registry.get(slug))
        except (ValueError, OSError, KeyError, TypeError) as exc:
            errors.append({'slug': slug, 'reason': str(exc)})
    browser_slugs = sorted(required | set(config.get('additionalBrowserPosts', [])))
    browser = {}
    for slug in browser_slugs:
        post = posts.get(slug)
        entry = registry.get(slug, {})
        if not post or not entry.get('hero') or not entry.get('share'):
            errors.append({'slug': slug, 'reason': 'Browser coverage requires a canonical post and hero/share registry'})
            continue
        browser['/blog/' + slug] = {'slug': slug, 'sourcePostSha256': digest(post),
                                  'title': post['title'], 'caption': post.get('imageAlt', ''),
                                  'disallowInlineMedia': entry.get('disallowInlineMedia', False),
                                  'requiredLiveParagraphs': entry.get('requiredLiveParagraphs', []),
                                  'hero': entry['hero'], 'share': entry['share']}
    return {'requiredPosts': sorted(required), 'contracts': checked, 'errors': errors, 'browserPosts': browser}


def inventory(root, journal, registry):
    rows = []
    for post in journal:
        row = {'slug': post['slug'], 'postSha256': digest(post), 'registered': post['slug'] in registry, 'assets': {}}
        for kind, key in (('hero', 'image'), ('share', 'ogImage')):
            item = {'path': post.get(key), 'status': 'unreviewed', 'reasons': []}
            try:
                item.update(inspect_asset(root, post.get(key)))
                if item['format'] == 'SVG':
                    item['reasons'].append('SVG hero/share is not actual subject photography')
                if not item['size'] or item['size'][0] < 1600 or item['size'][1] < 900:
                    item['reasons'].append('Native image is below1600x900')
                if item['reasons']:
                    item['status'] = 'failed'
                else:
                    entry = registry.get(post['slug'], {})
                    if entry.get('contractVersion') == 2:
                        binding = validate_contract(root, post, entry)[kind]
                        item['status'] = 'reviewed' if binding['productionReviewStatus'] == 'passed' else 'production-review-pending'
                        item['reasons'].append('Exact image/article source and production reviews passed' if item['status'] == 'reviewed' else 'Source contract passed; actual production review is still pending')
                    else:
                        item['reasons'].append('No version2 source/production review bound to this exact article and image')
            except (ValueError, OSError, KeyError, TypeError) as exc:
                item.update(status='failed', reasons=[str(exc)])
            row['assets'][kind] = item
        rows.append(row)
    counts = {status: sum(asset['status'] == status for row in rows for asset in row['assets'].values())
              for status in ('reviewed', 'failed', 'unreviewed', 'production-review-pending')}
    return {'articleCount': len(rows), 'registeredArticleCount': sum(row['registered'] for row in rows),
            'assetCounts': counts, 'status': 'reviewed' if counts['reviewed'] == 2 * len(rows) else 'incomplete',
            'boundary': 'Read-only inventory, not an unpublish action or a blanket visual approval. Unreviewed is not evidence that a photograph is bad.',
            'articles': rows}

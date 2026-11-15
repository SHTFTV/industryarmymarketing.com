import copy
import hashlib
import tempfile
from pathlib import Path
import unittest

from PIL import Image
from media_contract import PUBLIC, coverage, inventory, validate_contract
from runtime import digest


class MediaContractTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.public = self.root / PUBLIC
        self.public.mkdir(parents=True)
        self.path = '/photo.jpg'
        Image.new('RGB', (1600, 900), '#204d3f').save(self.public / 'photo.jpg')
        self.sha = hashlib.sha256((self.public / 'photo.jpg').read_bytes()).hexdigest()
        self.post = {'slug': 'legacy-post', 'title': 'Existing published guide', 'image': self.path,
                     'ogImage': self.path, 'imageAlt': 'Manufacturer product photograph and credit',
                     'publishedAt': '2026-10-28T23:02:23-07:00'}
        asset = {'path': self.path, 'sha256': self.sha, 'nativeSize': [2400, 2500],
                 'mediaType': 'source-photograph', 'upscaled': False,
                 'sourceUrl': 'https://manufacturer.example/press/photo', 'credit': 'Manufacturer',
                 'rightsEvidence': 'Exact editorial reuse evidence', 'visualReview': 'Exact source reviewed',
                 'visualApproval': {'status': 'passed', 'sha256': self.sha, 'postSha256': digest(self.post),
                                    'reviewedAt': '2026-11-15T00:00:00Z', 'desktopEvidence': 'desktop.png', 'phoneEvidence': 'phone.png'}}
        self.entry = {'contractVersion': 2, 'hero': copy.deepcopy(asset), 'share': copy.deepcopy(asset)}
        self.config = {'requiredPosts': [self.post['slug']]}

    def tearDown(self):
        self.temp.cleanup()

    def test_existing_publication_is_not_exempt_from_missing_registry(self):
        result = coverage(self.root, [self.post], {}, self.config)
        self.assertEqual(len(result['errors']), 2)
        self.assertIn('required version2 media registry', result['errors'][0]['reason'])

    def test_http_success_and_alt_are_not_a_source_approval(self):
        self.entry['hero']['visualApproval'] = {}
        with self.assertRaisesRegex(ValueError, 'actual source review'):
            validate_contract(self.root, self.post, self.entry)

    def test_removed_decorative_inline_media_cannot_silently_return(self):
        self.entry['disallowInlineMedia'] = True
        self.post['richContent'] = {'sections': [{'image': {'src': '/old-diagram.svg'}}]}
        for asset in (self.entry['hero'], self.entry['share']):
            asset['visualApproval']['postSha256'] = digest(self.post)
        with self.assertRaisesRegex(ValueError, 'decorative inline media'):
            validate_contract(self.root, self.post, self.entry)

    def test_legacy_1600_by_800_svg_fails(self):
        (self.public / 'concept.svg').write_text('<svg width="1600" height="800"></svg>')
        self.post['image'] = self.entry['hero']['path'] = '/concept.svg'
        with self.assertRaisesRegex(ValueError, '1600x900 raster'):
            validate_contract(self.root, self.post, self.entry)

    def test_photo_byte_change_invalidates_review(self):
        Image.new('RGB', (1600, 900), '#ffffff').save(self.public / 'photo.jpg')
        with self.assertRaisesRegex(ValueError, 'bytes changed'):
            validate_contract(self.root, self.post, self.entry)

    def test_article_change_invalidates_review(self):
        self.post['title'] = 'A different article'
        with self.assertRaisesRegex(ValueError, 'article hashes'):
            validate_contract(self.root, self.post, self.entry)

    def test_sharing_cannot_keep_the_stale_placard(self):
        self.post['ogImage'] = '/old-share.jpg'
        for asset in (self.entry['hero'], self.entry['share']):
            asset['visualApproval']['postSha256'] = digest(self.post)
        with self.assertRaisesRegex(ValueError, 'share differs'):
            validate_contract(self.root, self.post, self.entry)

    def test_source_pass_does_not_create_production_pass(self):
        result = validate_contract(self.root, self.post, self.entry)
        self.assertEqual(result['hero']['sourceReviewStatus'], 'passed')
        self.assertEqual(result['hero']['productionReviewStatus'], 'review-pending')
        report = inventory(self.root, [self.post], {self.post['slug']: self.entry})
        self.assertEqual(report['assetCounts']['reviewed'], 0)
        self.assertEqual(report['status'], 'incomplete')

    def test_copying_source_approval_never_creates_a_production_pass(self):
        for asset in (self.entry['hero'], self.entry['share']):
            asset['productionReview'] = copy.deepcopy(asset['visualApproval'])
        report = inventory(self.root, [self.post], {self.post['slug']: self.entry})
        self.assertEqual(report['assetCounts']['reviewed'], 0)
        self.assertEqual(report['status'], 'incomplete')

    def test_production_approval_must_bind_real_page_identity_viewports_post_and_photo(self):
        Image.new('RGB', (1440,1100), '#204d3f').save(self.root / 'desktop.png')
        Image.new('RGB', (390,844), '#204d3f').save(self.root / 'phone.png')
        for asset in (self.entry['hero'], self.entry['share']):
            asset['productionReview'] = dict(copy.deepcopy(asset['visualApproval']),
                reviewKind='production-page', canonical='https://www.industryarmymarketing.com/blog/legacy-post',
                deploymentSourceCommit='1' * 40, desktopViewport=[1440,1100], phoneViewport=[390,844])
        report = inventory(self.root, [self.post], {self.post['slug']: self.entry})
        self.assertEqual(report['assetCounts']['reviewed'], 2)
        self.entry['hero']['productionReview']['postSha256'] = 'stale'
        report = inventory(self.root, [self.post], {self.post['slug']: self.entry})
        self.assertEqual(report['status'], 'incomplete')
        self.entry['share']['productionReview']['canonical'] = 'https://www.industryarmymarketing.com/blog/a-different-post'
        report = inventory(self.root, [self.post], {self.post['slug']: self.entry})
        self.assertEqual(report['assetCounts']['reviewed'], 0)

    def test_source_proof_names_and_missing_production_files_cannot_pass(self):
        for asset in (self.entry['hero'], self.entry['share']):
            asset['productionReview'] = dict(copy.deepcopy(asset['visualApproval']),
                reviewKind='production-page', canonical='https://www.industryarmymarketing.com/blog/legacy-post',
                deploymentSourceCommit='1' * 40, desktopViewport=[1440,1100], phoneViewport=[390,844])
        self.assertEqual(inventory(self.root,[self.post],{self.post['slug']:self.entry})['assetCounts']['reviewed'],0)
        Image.new('RGB',(1440,1100)).save(self.root/'source-desktop.png')
        Image.new('RGB',(390,844)).save(self.root/'source-phone.png')
        for asset in (self.entry['hero'], self.entry['share']):
            asset['productionReview'].update(desktopEvidence='source-desktop.png',phoneEvidence='source-phone.png')
        self.assertEqual(inventory(self.root,[self.post],{self.post['slug']:self.entry})['assetCounts']['reviewed'],0)

    def test_unregistered_large_photo_is_unknown_not_approved_or_assumed_bad(self):
        report = inventory(self.root, [self.post], {})
        self.assertEqual(report['assetCounts']['unreviewed'], 2)
        self.assertEqual(report['assetCounts']['failed'], 0)
        self.assertEqual(report['status'], 'incomplete')


if __name__ == '__main__':
    unittest.main()

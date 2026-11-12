import datetime as dt
import json
from unittest.mock import patch
import urllib.error
import unittest
import test_approved_launches as launchfixtures
from prebuild import assess, rules
from recovery import fetch_all, recover_expired, eligible
from blockers import observe

class RecoveryTests(unittest.TestCase):
    setUp=launchfixtures.ApprovedLaunchTests.setUp
    invoke_writer=launchfixtures.ApprovedLaunchTests.invoke_writer
    def test_bad_media_does_not_stop_next_launch_same_invocation(self):
        state,journal=self.invoke_writer(media_failure_first=True)
        self.assertEqual([p['slug'] for p in journal],['second-launch'])
        self.assertEqual(state['rows']['first-launch']['status'],'blocked')
        self.assertEqual(state['rows']['second-launch']['status'],'verified')
        self.assertEqual(len(state['attemptReceipts']),1)
        self.assertTrue(any(v['status']=='open' for v in state['persistentBlockers'].values()))

    def test_failed_first_source_does_not_skip_later_sources(self):
        calls=[]
        def fetch(url):
            calls.append(url)
            if url.endswith('bad'):raise urllib.error.URLError('test transport failed')
            return {'url':url,'text':'Valid source'}
        sources,failures=fetch_all(['https://example.com/bad','https://example.com/good'],fetch)
        self.assertEqual(len(calls),2);self.assertEqual(len(sources),1);self.assertEqual(len(failures),1)

    def test_expired_uploaded_claim_verifies_existing_without_redating(self):
        original=json.loads((self.ops/'approved-launches/first-launch.json').read_text())
        original['publishedAt']='2026-11-10T01:02:03Z'
        initial={'rows':{'first-launch':{'status':'claimed','attempts':1,'owner':'expired','sourceDomain':'example.com'}},
                 'lease':{'owner':'expired','until':'2025-01-01T00:00:00+00:00'}}
        state,journal=self.invoke_writer(initial=initial,journal_records=[original])
        self.assertEqual(len(journal),1)
        self.assertEqual(journal[0]['publishedAt'],original['publishedAt'])
        self.assertEqual(state['rows']['first-launch']['status'],'verified')
        self.assertTrue(state['rows']['first-launch']['evidence']['recoveredExistingCanonical'])

    def test_active_lease_not_recovered_and_retry_respects_cap(self):
        now=dt.datetime.now(dt.timezone.utc)
        state={'rows':{'first-launch':{'status':'claimed','attempts':1}},'lease':{'owner':'active','until':(now+dt.timedelta(minutes=5)).isoformat()}}
        recover_expired(state,[],now)
        self.assertEqual(state['rows']['first-launch']['status'],'claimed')
        self.assertFalse(eligible({'status':'retry','attempts':3},now))
        self.assertFalse(eligible({'status':'retry','attempts':1,'nextRetryAt':(now+dt.timedelta(seconds=1)).isoformat()},now))

    def test_prebuild_unknown_runtime_proof_is_a_block(self):
        result=assess(self.root)
        self.assertFalse(result['dependentExtensionsAllowed'])
        self.assertTrue(any('runtime' in s for s in result['blockers']))
        self.assertTrue(any('production publication' in s for s in result['blockers']))

    def test_changed_canonical_rules_fence_old_checkout(self):
        (self.root/'docs').mkdir(exist_ok=True)
        (self.root/'docs/IAM-SOT.md').write_text('approved rules')
        (self.ops/'policy.json').write_text('{}')
        (self.ops/'build-contract.json').write_text('{}')
        with patch('prebuild.subprocess.run'),patch('prebuild.subprocess.check_output',return_value=b'new canonical rules'):
            with self.assertRaisesRegex(RuntimeError,'Canonical SOT changed'):rules(self.root,remote=True)

    def test_unrelated_success_cannot_clear_pending_item_alert(self):
        state={'persistentBlockers':{'iam:first:media':{'id':'iam:first:media','slug':'first','status':'open'}}}
        outbox=observe(state,{'blockers':['Writing-service runtime proof missing']},'2026-11-12T01:00:00Z')
        self.assertEqual(len(outbox['issues']),2)
        observe(state,{'blockers':[]},'2026-11-12T01:05:00Z')
        self.assertEqual(state['persistentBlockers']['iam:first:media']['status'],'open')
        self.assertFalse(outbox['deliveryVerified'])

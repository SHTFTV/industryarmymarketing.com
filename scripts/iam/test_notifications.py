import copy
import unittest
from notifications import reconcile,notice_id,apply_receipts

NOW='2026-11-12T02:50:00+00:00'
def verified(domain='example.com'):
    return {'status':'verified','sourceDomain':domain,'canonical':'https://www.industryarmymarketing.com/blog/example',
            'verifiedAt':'2026-11-12T02:41:00Z','evidence':{**{k:True for k in ['http','canonical','schema','discovery','desktop','phone','image']},'runUrl':'https://github.com/example/run'}}

class NotificationTests(unittest.TestCase):
    def test_queue_and_accepted_receipt_never_imply_delivery(self):
        journal=reconcile({'rows':{'example':verified()}},None,NOW)
        self.assertEqual(journal['events'][0]['deliveryStatus'],'queued')
        with self.assertRaises(ValueError):apply_receipts(journal,[{'eventId':journal['events'][0]['eventId'],'kind':'accepted'}])

    def test_exact_verified_article_deduplicates_and_keeps_delivery(self):
        state={'rows':{'example':verified()}};journal=reconcile(state,None,NOW);event=journal['events'][0]
        apply_receipts(journal,[{'eventId':event['eventId'],'kind':'observed_user_report','reportDigest':'a'*64,'deliveredAt':NOW}])
        state['rows']['example']['verifiedAt']='2026-11-12T02:49:00Z'
        again=reconcile(state,journal,'2026-11-12T02:55:00Z')
        self.assertEqual(len(again['events']),1)
        self.assertEqual(again['events'][0]['deliveryStatus'],'delivered')

    def test_missing_production_proof_cannot_generate_success_notice(self):
        row=verified();row['evidence']['image']=False
        self.assertEqual(reconcile({'rows':{'example':row}},None,NOW)['events'],[])

    def test_spacing_hold_resolves_without_sending_stale_notice(self):
        state={'lastVerifiedAt':'2026-11-12T02:41:00Z','rows':{'next-welcome-site':{'status':'pending'}}}
        journal=reconcile(state,None,NOW)
        self.assertEqual(journal['events'][0]['kind'],'spacing_hold')
        state['rows']['next-welcome-site']=verified()
        journal=reconcile(state,journal,NOW)
        held=next(e for e in journal['events'] if e['kind']=='spacing_hold')
        self.assertEqual(held['lifecycle'],'resolved');self.assertEqual(held['deliveryStatus'],'superseded')

    def test_unchanged_blocker_remains_after_other_publication(self):
        state={'rows':{'blocked':{'status':'blocked','sourceDomain':'blocked.example','nextAction':'Exact image missing','attempts':1}}}
        journal=reconcile(state,None,NOW);event_id=journal['events'][0]['eventId']
        state['rows']['other']=verified('other.example')
        journal=reconcile(state,journal,NOW)
        self.assertEqual(next(e for e in journal['events'] if e['eventId']==event_id)['lifecycle'],'open')

    def test_failed_delivery_retries_same_event_without_duplicate_attempt_or_false_success(self):
        journal=reconcile({'rows':{'example':verified()}},None,NOW);event=journal['events'][0]
        receipt={'kind':'observed_delivery_attempt','eventId':event['eventId'],'attemptDigest':'b'*64,'attemptedAt':NOW}
        apply_receipts(journal,[receipt,receipt])
        self.assertEqual(event['deliveryAttempts'],1);self.assertEqual(event['deliveryStatus'],'retry')
        self.assertIsNone(event['deliveryReceipt'])
        apply_receipts(journal,[{'kind':'observed_user_report','eventId':event['eventId'],'reportDigest':'c'*64,'deliveredAt':NOW}])
        self.assertEqual(event['deliveryStatus'],'delivered');self.assertEqual(event['deliveryAttempts'],1)

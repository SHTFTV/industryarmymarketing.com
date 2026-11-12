import datetime as dt
import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('iam_health',Path(__file__).parent/'iam-health-recovery.py')
health=importlib.util.module_from_spec(spec);spec.loader.exec_module(health)
NOW=dt.datetime(2026,11,12,4,tzinfo=dt.timezone.utc)
class HealthTests(unittest.TestCase):
    def test_active_writer_never_dispatched_again(self):
        self.assertFalse(health.decision({},[{'status':'in_progress','html_url':'actual-run'}],NOW,True)['dispatch'])
    def test_recent_run_enforces_dispatch_spacing_even_for_probe(self):
        self.assertFalse(health.decision({},[{'status':'completed','created_at':(NOW-dt.timedelta(seconds=599)).isoformat()}],NOW,True)['dispatch'])
    def test_cadence_hold_avoids_costly_work(self):
        state={'lastVerifiedAt':(NOW-dt.timedelta(minutes=30)).isoformat(),'rows':{'pending':{'status':'pending'}}}
        self.assertFalse(health.decision(state,[],NOW)['dispatch'])
    def test_eligible_later_item_recovers_even_with_another_blocked(self):
        state={'rows':{'bad':{'status':'blocked'},'good':{'status':'pending','attempts':0}}}
        self.assertTrue(health.decision(state,[],NOW)['dispatch'])
    def test_no_work_no_dispatch_and_probe_does_not_claim_publication(self):
        self.assertFalse(health.decision({'rows':{}},[],NOW)['dispatch'])
        self.assertTrue(health.decision({'rows':{}},[],NOW,True)['dispatch'])

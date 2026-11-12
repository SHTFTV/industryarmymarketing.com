import datetime as dt
import unittest
from poll_due import should_execute

class PollTests(unittest.TestCase):
    def test_fast_poll_cannot_shorten_hour_spacing(self):
        now=dt.datetime(2026,11,12,2,38,47,tzinfo=dt.timezone.utc)
        state={'lastVerifiedAt':'2026-11-12T01:38:47.450012+00:00','rows':{'launch':{'status':'pending','attempts':0}}}
        self.assertFalse(should_execute(state,'schedule',now))
        self.assertTrue(should_execute(state,'schedule',now+dt.timedelta(seconds=1)))

    def test_blocked_and_exhausted_work_does_not_start_expensive_runtime(self):
        now=dt.datetime(2026,11,12,2,tzinfo=dt.timezone.utc)
        self.assertFalse(should_execute({'rows':{'a':{'status':'blocked','attempts':1},'b':{'status':'retry','attempts':3}}},'schedule',now))

    def test_expired_claim_gets_recovery_but_active_lease_stays_exclusive(self):
        now=dt.datetime(2026,11,12,2,tzinfo=dt.timezone.utc)
        state={'rows':{'a':{'status':'claimed','attempts':1}},'lease':{'owner':'a','until':'2026-11-12T01:59:00Z'}}
        self.assertTrue(should_execute(state,'schedule',now))
        state['lease']['until']='2026-11-12T02:01:00Z'
        self.assertFalse(should_execute(state,'schedule',now))

    def test_code_push_checks_still_run_during_hold(self):
        now=dt.datetime.now(dt.timezone.utc)
        self.assertTrue(should_execute({'lastVerifiedAt':now.isoformat()},'push',now))

import copy
import datetime as dt
import unittest
from zoneinfo import ZoneInfo
from runtime import claim, complete, reconcile, daily_due, renew

NOW = dt.datetime(2026, 11, 11, 5, 0, tzinfo=dt.timezone.utc)

class RuntimeTests(unittest.TestCase):
    def state(self):
        return {'rows': {'a': {'status': 'pending', 'attempts': 0}, 'b': {'status': 'withdrawn', 'attempts': 0}}}

    def test_history_never_reseeded(self):
        s = self.state()
        q = {'articles': [{'slug': 'a', 'stage': 'planned', 'siteDomain': 'a.test', 'canonical': 'https://iam.test/a'}, {'slug': 'b', 'stage': 'planned', 'siteDomain': 'b.test', 'canonical': 'https://iam.test/b'}]}
        s['rows']['a']['status'] = 'blocked'
        reconcile(s, [], q)
        self.assertEqual(s['rows']['a']['status'], 'blocked')
        self.assertEqual(s['rows']['b']['status'], 'withdrawn')

    def test_global_writer_competition(self):
        s = self.state(); claim(s, 'a', 'first', NOW)
        s['rows']['c'] = {'status': 'pending', 'attempts': 0}
        with self.assertRaises(ValueError): claim(s, 'c', 'other', NOW)

    def test_hourly_interval_and_withdrawal(self):
        s = self.state(); s['lastVerifiedAt'] = (NOW-dt.timedelta(seconds=3599)).isoformat()
        with self.assertRaises(ValueError): claim(s, 'a', 'x', NOW)
        with self.assertRaises(ValueError): claim(s, 'b', 'x', NOW)

    def test_incomplete_receipt_cannot_verify(self):
        s = self.state(); claim(s, 'a', 'x', NOW)
        with self.assertRaises(ValueError): complete(s, 'a', 'x', {'http': True}, NOW)
        self.assertEqual(s['rows']['a']['status'], 'claimed')

    def test_exact_lease_renew_and_attempt_cap(self):
        s = self.state(); claim(s, 'a', 'x', NOW)
        with self.assertRaises(ValueError): renew(s, 'other', NOW)
        s['rows']['a'].update(status='retry', attempts=3)
        with self.assertRaises(ValueError): claim(s, 'a', 'x', NOW)

    def test_daily_vancouver_dst(self):
        for month in (7,11):
            local=dt.datetime(2026,month,10,20,30,tzinfo=ZoneInfo('America/Vancouver'))
            utc=local.astimezone(dt.timezone.utc)
            self.assertTrue(daily_due(utc,{}))
            self.assertFalse(daily_due(utc-dt.timedelta(hours=1),{}))
            self.assertFalse(daily_due(utc,{'dailyJournalDate':local.date().isoformat()}))

if __name__ == '__main__': unittest.main()

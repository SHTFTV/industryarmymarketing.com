import datetime as dt
import unittest
from automatic_trigger import verify,REPO

NOW=dt.datetime(2026,11,12,3,tzinfo=dt.timezone.utc)
class TriggerTests(unittest.TestCase):
    def env(self):return {'GITHUB_EVENT_NAME':'workflow_dispatch','IAM_AUTOMATIC_RECOVERY':'true','GITHUB_REPOSITORY':REPO,'GITHUB_ACTOR':'github-actions[bot]','IAM_RECOVERY_ORIGIN_RUN':'https://github.com/'+REPO+'/actions/runs/123'}
    def origin(self):return {'path':'.github/workflows/iam-health.yml','head_branch':'main','repository':{'full_name':REPO},'run_started_at':'2026-11-12T02:59:00Z','event':'push'}
    def test_push_cannot_become_an_automatic_recovery(self):
        env=self.env();env['GITHUB_EVENT_NAME']='push'
        self.assertFalse(verify(env,lambda _:self.origin(),NOW)['verified'])
    def test_declared_flag_or_manual_actor_is_insufficient(self):
        env=self.env();env['GITHUB_ACTOR']='manual-user'
        self.assertFalse(verify(env,lambda _:self.origin(),NOW)['verified'])
    def test_actual_health_origin_is_verified_separately_from_native_schedule(self):
        result=verify(self.env(),lambda _:self.origin(),NOW)
        self.assertTrue(result['verified']);self.assertEqual(result['kind'],'verified-health-recovery')
    def test_wrong_workflow_and_stale_origin_are_rejected(self):
        self.assertFalse(verify(self.env(),lambda _:{**self.origin(),'path':'.github/workflows/unrelated.yml'},NOW)['verified'])
        self.assertFalse(verify(self.env(),lambda _:self.origin(),NOW+dt.timedelta(hours=1))['verified'])

import copy
import unittest
from report_execution import execution,record

class ExecutionTests(unittest.TestCase):
    def context(self,event='schedule'):
        return {'runUrl':'https://github.com/SHTFTV/industryarmymarketing.com/actions/runs/123','event':event,'checkedAt':'2026-11-11T17:20:00Z','jobResult':'failure'}
    def test_pre_writer_failure_replaces_stale_status_preserves_queue_and_lease(self):
        s={'rows':{'withdrawn':{'status':'withdrawn'}},'lease':{'owner':'other','until':'future'},'lastRun':{'error':'old credential gate'}}
        original=copy.deepcopy(s)
        jobs=[{'name':'publish','conclusion':'failure','steps':[{'name':'Install browser verifier','conclusion':'failure'},{'name':'One source-to-verified-publication transaction','conclusion':'skipped'}]}]
        r=execution(jobs,s,self.context());record(s,r)
        self.assertEqual(s['lastRun']['status'],'prewriter-failed')
        self.assertEqual(s['lastWriterRun'],original['lastRun'])
        self.assertEqual(s['rows'],original['rows']);self.assertEqual(s['lease'],original['lease'])
        self.assertTrue(r['scheduledExecutionObserved']);self.assertFalse(r['automaticPublicationVerified'])
    def test_successful_zero_article_job_is_not_verified_publication(self):
        r=execution([{'name':'publish','conclusion':'success','steps':[{'name':'One source-to-verified-publication transaction','conclusion':'success'}]}],{'receipts':[]},self.context())
        self.assertTrue(r['writerExecuted']);self.assertFalse(r['automaticPublicationVerified']);self.assertEqual(r['verifiedPublicationCount'],0)
    def test_manual_publication_never_counts_as_automatic(self):
        c=self.context('workflow_dispatch')
        r=execution([{'name':'publish','conclusion':'success','steps':[]}],{'receipts':[{'runUrl':c['runUrl']}]},c)
        self.assertEqual(r['verifiedPublicationCount'],1);self.assertFalse(r['automaticPublicationVerified'])
    def test_receipt_deduplication(self):
        c=self.context();s={};r=execution([{'name':'publish','conclusion':'failure','steps':[]}],s,c)
        record(s,r);record(s,r);self.assertEqual(len(s['executionHistory']),1)

if __name__=='__main__':unittest.main()

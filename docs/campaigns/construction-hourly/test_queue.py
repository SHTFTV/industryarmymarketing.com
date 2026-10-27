import unittest,tempfile,pathlib,json
import queue as q
class Tests(unittest.TestCase):
 def setUp(self):
  self.t=tempfile.TemporaryDirectory();self.c=q.connect(pathlib.Path(self.t.name)/'test.sqlite');self.a={'slug':'guide','expectedTitle':'Guide','canonical':'https://example.com/guide','stage':'planned','discovery':['https://example.com/blog/'],'requiredContact':'owner@example.com','publishedDate':'2026-10-27','siteDomain':'builders.example','intent':'planning','contentFocus':'original','guestUrl':None,'guestStatus':'not_requested'};self.q={'campaign':'finite','domain':'example.com','articles':[self.a]};q.seed(self.c,self.q)
 def tearDown(self):self.c.close();self.t.cleanup()
 def test_duplicate_queue(self):
  with self.assertRaises(ValueError):q.validate({**self.q,'articles':[self.a,self.a]})
 def test_claim_excludes_active(self):
  self.assertEqual(len(q.claim(self.c,'finite',1,'one')),1);self.assertEqual(q.claim(self.c,'finite',1,'one'),[])
 def test_global_writer_lock(self):
  q.lease(self.c,'one')
  with self.assertRaises(ValueError):q.lease(self.c,'two')
 def test_cannot_provideralias(self):
  with self.assertRaises(ValueError):q.validate({**self.q,'articles':[{**self.a,'canonical':'https://alias.vercel.app/guide'}]})
 def test_published_duplicate(self):
  self.c.execute("UPDATE articles SET stage='verified'");self.c.commit();self.assertEqual(q.claim(self.c,'finite',1,'one'),[]);self.assertTrue(q.report(self.c,'finite')['complete'])
 def test_amend_active_contact(self):
  a=q.claim(self.c,'finite',1,'one')[0];v=q.amend(self.c,'finite','example.com','guide',a['claimToken'],'one',{'requiredContact':'https://example.com/contact?ref_site=buildershaus.com'},'Correct native form destination');self.assertIn('/contact?',v['payload']['requiredContact'])
 def test_amend_canonical_forbidden(self):
  a=q.claim(self.c,'finite',1,'one')[0]
  with self.assertRaises(ValueError):q.amend(self.c,'finite','example.com','guide',a['claimToken'],'one',{'canonical':'https://example.com/new'},'test')
 def test_renew_both_leases(self):
  a=q.claim(self.c,'finite',1,'one')[0];r=q.renew_claim(self.c,'finite','example.com','guide',a['claimToken'],'one');self.assertTrue(r['renewed']);self.assertEqual(self.c.execute('SELECT lease_until FROM articles').fetchone()[0],self.c.execute('SELECT until FROM leases').fetchone()[0])
 def test_refresh_planned_payload(self):
  newer={**self.a,'expectedTitle':'Updated title','publishedDate':'2026-10-28'};q.seed(self.c,{**self.q,'articles':[newer]});a=q.claim(self.c,'finite',1,'one')[0];self.assertEqual(a['expectedTitle'],'Updated title');self.assertEqual(a['publishedDate'],'2026-10-28')
 def test_verified_never_regresses(self):
  self.c.execute("UPDATE articles SET stage='verified'");self.c.commit();q.seed(self.c,{**self.q,'articles':[{**self.a,'publishedDate':'2026-10-28'}]});r=self.c.execute('SELECT * FROM articles').fetchone();self.assertEqual(r['stage'],'verified');self.assertEqual(json.loads(r['payload'])['publishedDate'],'2026-10-27')
 def test_blank_date_needs_set_before_claim(self):
  q.seed(self.c,{**self.q,'articles':[{**self.a,'publishedDate':None}]})
  with self.assertRaises(ValueError):q.claim(self.c,'finite',1,'one')
 def test_three_attempt_limit(self):
  for i in range(3):
   self.assertEqual(len(q.claim(self.c,'finite',1,'one')),1);self.c.execute("UPDATE articles SET lease_until='2000-01-01T00:00:00+00:00'");self.c.commit()
  self.assertEqual(q.claim(self.c,'finite',1,'one'),[]);self.assertEqual(q.report(self.c,'finite')['articles'][0]['stage'],'blocked')
 def test_hourly_spacing(self):
  self.c.execute("UPDATE articles SET stage='verified',verified_at=?",(q.now().isoformat(),));self.c.commit();second={**self.a,'slug':'second','canonical':'https://example.com/second'};q.seed(self.c,{**self.q,'articles':[second]});self.assertEqual(q.claim(self.c,'finite',1,'one'),[]);self.assertIsNotNone(q.report(self.c,'finite')['nextDue'])
 def test_empty_not_complete(self):self.assertFalse(q.report(self.c,'empty')['complete'])
if __name__=='__main__':unittest.main()

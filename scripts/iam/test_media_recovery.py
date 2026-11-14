import copy
import datetime as dt
import hashlib
import pathlib
import tempfile
import unittest
from poll_due import should_execute
from media_recovery import repaired_media, recover_reviewed_media


class MediaRecoveryTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = pathlib.Path(self.tmp.name)
        (self.root/'photo.jpg').write_bytes(b'exact-source-photograph')
        self.sha = hashlib.sha256(b'exact-source-photograph').hexdigest()
        self.now = dt.datetime(2026,11,13,23,tzinfo=dt.timezone.utc)
        self.state = {'rows': {'story': {'status':'blocked','stage':'media','attempts':1,'sourceDomain':'example.com','lastFailure':{'reason':'Missing exact source photo'}}}, 'persistentBlockers': {'media': {'status':'open'}}}
        asset = {'path':'/photo.jpg','sha256':self.sha,'mediaType':'source-photograph','sourceUrl':'https://www.example.com/projects/','credit':'Company archive','rightsEvidence':'Owner-authorized company photo','visualReview':'Exact crops inspected','upscaled':False,'nativeSize':[1920,1080],'visualApproval':{'status':'passed','sha256':self.sha,'desktopEvidence':'desktop.jpg','phoneEvidence':'phone.jpg','reviewedAt':self.now.isoformat()}}
        self.media = {'story': {'hero':asset,'share':copy.deepcopy(asset)}}

    def test_exact_reviewed_repair_resumes_without_resetting_attempts_or_alert(self):
        self.assertIn('story', recover_reviewed_media(self.state,self.media,self.root,self.now))
        row=self.state['rows']['story']
        self.assertEqual(row['status'],'retry')
        self.assertEqual(row['attempts'],1)
        self.assertEqual(self.state['persistentBlockers']['media']['status'],'open')
        row['status']='blocked'
        self.assertEqual(recover_reviewed_media(self.state,self.media,self.root,self.now),{})

    def test_no_retry_for_unchanged_absent_unreviewed_or_generic_media(self):
        self.assertEqual(repaired_media(self.state,{},self.root,self.now),{})
        for field,value in [('mediaType','illustration'),('sha256','changed'),('sourceUrl','https://unrelated.example/photo'),('visualApproval',{}),('upscaled',True)]:
            media=copy.deepcopy(self.media);media['story']['hero'][field]=value
            self.assertEqual(repaired_media(self.state,media,self.root,self.now),{})

    def test_cap_terminal_history_and_active_owner_remain_fenced(self):
        for status in ('verified','withdrawn','claimed'):
            state=copy.deepcopy(self.state);state['rows']['story']['status']=status
            self.assertEqual(repaired_media(state,self.media,self.root,self.now),{})
        self.state['rows']['story']['attempts']=3
        self.assertEqual(repaired_media(self.state,self.media,self.root,self.now),{})

    def test_scheduler_wakes_only_for_reviewed_repairs_after_hour_spacing(self):
        self.assertFalse(should_execute(self.state,'schedule',self.now,{},self.root))
        self.assertTrue(should_execute(self.state,'schedule',self.now,self.media,self.root))
        self.state['lastVerifiedAt']=(self.now-dt.timedelta(minutes=59)).isoformat()
        self.assertFalse(should_execute(self.state,'schedule',self.now,self.media,self.root))
        self.state['rows']['story']['attempts']=1
        self.state['lease']={'until':(self.now+dt.timedelta(minutes=5)).isoformat()}
        self.assertEqual(repaired_media(self.state,self.media,self.root,self.now),{})

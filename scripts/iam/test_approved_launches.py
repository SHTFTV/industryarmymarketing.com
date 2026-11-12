import copy
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from approved_launches import pending_launches, source_checked_post

class ApprovedLaunchTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.ops = self.root/'operations/iam'
        (self.ops/'approved-launches').mkdir(parents=True)
        self.entries = []
        for slug in ['first-launch', 'second-launch']:
            post = {'slug':slug,'campaignSite':'example.com','title':slug,'excerpt':'A site launch',
                    'metaDescription':'An authorized site launch','image':'/launch.jpg','ogImage':'/launch.jpg',
                    'imageAlt':'Actual site preview','richContent':{'intro':'Powered by Industry Army Marketing. A division of Parent.tv.',
                    'sections':[{'heading':'A useful site','paragraphs':['Visible source-backed features.']}],
                    'sources':[{'label':'Source','href':'https://example.com/'}]},'cta':{'buttonHref':'/contact'}}
            raw=(json.dumps(post,indent=2)+'\n').encode()
            (self.ops/'approved-launches'/(slug+'.json')).write_bytes(raw)
            self.entries.append({'slug':slug,'kind':'user-authorized-launch','authorization':'Explicit user request',
                'reviewed':True,'postSha256':hashlib.sha256(raw).hexdigest(),'sourceDomain':'example.com',
                'parentBrand':'Parent.tv','sourceUrls':['https://example.com/'],'requiredSourceText':['Example','Parent.tv']})
        (self.ops/'approved-launches.json').write_text(json.dumps({'releases':self.entries}))

    def test_changed_first_manuscript_is_held_without_starving_second(self):
        p=self.ops/'approved-launches/first-launch.json';p.write_text(p.read_text()+' ')
        state={'rows':{'historical':{'status':'withdrawn','attempts':2}}}
        candidates=pending_launches(self.root,state,[])
        self.assertEqual([a['slug'] for a in candidates],['second-launch'])
        self.assertIn('changed',state['approvedLaunchIssues'][0]['reason'])
        self.assertEqual(state['rows']['historical'],{'status':'withdrawn','attempts':2})

    def test_published_and_blocked_rows_are_not_reseeded(self):
        state={'rows':{'second-launch':{'status':'blocked','attempts':3}}}
        self.assertEqual(pending_launches(self.root,state,[{'slug':'first-launch'}]),[])
        self.assertEqual(state['rows']['second-launch'],{'status':'blocked','attempts':3})

    def test_changed_live_identity_holds_exact_manuscript(self):
        candidate=pending_launches(self.root,{},[])[0]
        with self.assertRaisesRegex(ValueError,'Live source'):
            source_checked_post(candidate,[{'text':'An unrelated parked domain'}])
        post=source_checked_post(candidate,[{'text':'Example — Parent.tv'}])
        post['title']='Changed after loading'
        self.assertNotEqual(post['title'],candidate['approvedPost']['title'])

    def invoke_writer(self,last=None,media_failure_first=False,initial=None,journal_records=None):
        import run
        journal=self.root/'artifacts/industry-army/src/data/buildJournal.json'
        journal.parent.mkdir(parents=True)
        journal.write_text(json.dumps(journal_records or []))
        baseline=self.root/'docs/campaigns/construction-hourly/queue-baseline.json'
        baseline.parent.mkdir(parents=True)
        baseline.write_text('{"articles":[]}')
        (self.root/'docs/IAM-SOT.md').write_text('IAM canonical SOT version 2')
        (self.ops/'build-contract.json').write_text('{}')
        (self.ops/'policy.json').write_text(json.dumps({'postDefaults':{}}))
        (self.ops/'state.json').write_text(json.dumps({'rows':{},'receipts':[],**({'lastVerifiedAt':last} if last else {}),**(initial or {})}))
        (self.ops/'media.json').write_text(json.dumps({e['slug']:{'hero':{'path':'/launch.jpg'},'share':{'path':'/launch.jpg'}} for e in self.entries}))
        evidence={k:True for k in ['http','canonical','schema','discovery','desktop','phone','image']}
        evidence.update(runUrl='https://github.com/example/run',trigger='schedule')
        with patch.dict(os.environ,{},clear=True),patch.object(run,'ROOT',self.root),patch.object(run,'STATE',self.ops/'state.json'),patch.object(run,'JOURNAL',journal),patch.object(run,'persist'),patch.object(run,'media_ok',side_effect=[ValueError('Bad first media'),None] if media_failure_first else None),patch.object(run,'fetch_source',return_value={'text':'Example Parent.tv','url':'https://example.com/'}),patch.object(run,'live_check',return_value=evidence),patch.object(run,'write_article',side_effect=AssertionError('Approved launch must not call generation')):
            old=Path.cwd()
            try:
                os.chdir(self.root);run.main()
            finally:os.chdir(old)
        return json.loads((self.ops/'state.json').read_text()),json.loads(journal.read_text())

    def test_existing_writer_publishes_one_approved_launch_without_model_key(self):
        state,journal=self.invoke_writer()
        self.assertEqual(len(journal),1)
        self.assertEqual(state['rows']['first-launch']['status'],'verified')
        self.assertEqual(state['rows']['second-launch']['attempts'],0)
        self.assertFalse(state['rows']['first-launch']['evidence']['automaticAuthorship'])
        self.assertNotIn('lease',state)

    def test_approved_launch_cannot_bypass_hour_spacing(self):
        state,journal=self.invoke_writer(dt.datetime.now(dt.timezone.utc).isoformat())
        self.assertEqual(journal,[])
        self.assertEqual(state['lastRun']['status'],'cadence-not-due')
        self.assertEqual(state['rows']['first-launch']['attempts'],0)
        self.assertNotIn('lease',state)

if __name__=='__main__':unittest.main()


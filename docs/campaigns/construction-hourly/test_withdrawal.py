import importlib.util,tempfile,json
from pathlib import Path
p=Path(__file__).resolve().parent/'queue.py';spec=importlib.util.spec_from_file_location('workflow',p);w=importlib.util.module_from_spec(spec);spec.loader.exec_module(w)
with tempfile.TemporaryDirectory() as t:
 c=w.connect(Path(t)/'test.sqlite');stamp=w.now().isoformat();original={'passed':True,'commit':'old','checks':[{'width':390}]};a={'canonical':'https://example.com/article'}
 c.execute('INSERT INTO articles VALUES(?,?,?,?,?,?,?,?,?)',('test','example.com','article',json.dumps(a),'verified',None,None,stamp,json.dumps(original)));c.commit();w.lease(c,'owner');e={'passed':True,'commit':'new','deployment':'deploy','checked_at':stamp,'http':410,'discoveryRemoved':True,'url':a['canonical']}
 try:w.withdraw(c,'test','example.com','article','wrong','Owner request',e);raise AssertionError('wrong owner accepted')
 except ValueError:pass
 out=w.withdraw(c,'test','example.com','article','owner','Owner request',e);r=c.execute('SELECT * FROM articles').fetchone();assert r['verified_at']==stamp;assert json.loads(r['evidence'])['commit']=='old';assert out['verifiedCount']==0 and out['withdrawnCount']==1 and out['activeTarget']==0 and out['remaining']==0;assert out['nextDue'];assert w.claim(c,'test',owner='owner')==[]
 print('PASS: wrong owner rejected; original evidence/time retained; active scope excludes withdrawal; cadence retained; no reissue')

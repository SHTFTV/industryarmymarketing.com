"""Finite manual campaign queue. Separate SQLite only; no publishing or scheduler."""
import argparse,datetime,json,pathlib,sqlite3,uuid
from urllib.parse import urlparse
ROOT=pathlib.Path(__file__).resolve().parent
STAGES=('planned','claimed','verified','blocked')
def validate(q):
 if not q.get('campaign') or not q.get('domain') or not isinstance(q.get('articles'),list):raise ValueError('campaign, domain and articles required')
 seen=set()
 for a in q['articles']:
  if any(k not in a for k in ('slug','expectedTitle','canonical','stage','discovery','requiredContact','publishedDate','siteDomain','intent','contentFocus','guestUrl','guestStatus')):raise ValueError('Missing required article fields')
  u=urlparse(a['canonical'])
  if u.scheme!='https' or u.hostname not in(q['domain'],'www.'+q['domain']):raise ValueError('Actual custom-domain HTTPS canonical required')
  if a['slug'] in seen:raise ValueError('duplicate published/planned slug: '+a['slug'])
  seen.add(a['slug'])
  if a.get('stage','planned') not in STAGES:raise ValueError('unknown stage')
 return q
def connect(path=None):
 c=sqlite3.connect(path or ROOT/'campaign.sqlite',timeout=20);c.row_factory=sqlite3.Row
 c.execute('CREATE TABLE IF NOT EXISTS articles(campaign TEXT,domain TEXT,slug TEXT,payload TEXT,stage TEXT,token TEXT,lease_until TEXT,verified_at TEXT,evidence TEXT,PRIMARY KEY(campaign,domain,slug))')
 c.execute('CREATE TABLE IF NOT EXISTS leases(resource TEXT PRIMARY KEY,owner TEXT,until TEXT)')
 c.execute('CREATE TABLE IF NOT EXISTS attempts(campaign TEXT,domain TEXT,slug TEXT,n INTEGER,PRIMARY KEY(campaign,domain,slug))')
 c.execute('CREATE TABLE IF NOT EXISTS runs(campaign TEXT,started TEXT,mode TEXT,status TEXT,evidence TEXT)');return c
def now():return datetime.datetime.now(datetime.timezone.utc)
def seed(c,q):
 validate(q)
 for a in q['articles']:
  old=c.execute('SELECT stage,payload FROM articles WHERE campaign=? AND domain=? AND slug=?',(q['campaign'],q['domain'],a['slug'])).fetchone()
  if old:
   prior=json.loads(old['payload'])
   if prior['canonical']!=a['canonical']:raise ValueError('Cannot silently change existing canonical')
   if old['stage']=='planned':c.execute('UPDATE articles SET payload=? WHERE campaign=? AND domain=? AND slug=? AND stage="planned"',(json.dumps({**a,'stage':'planned'}),q['campaign'],q['domain'],a['slug']))
   continue
  if a.get('stage') in ('verified','claimed'):raise ValueError('New queue rows cannot self-assert claimed/verified; claim and record acceptance evidence')
  c.execute('INSERT INTO articles VALUES(?,?,?,?,?,?,?,?,?)',(q['campaign'],q['domain'],a['slug'],json.dumps(a),a.get('stage','planned'),None,None,None,None))
 c.commit()
def lease(c,owner,renew=False):
 c.execute('BEGIN IMMEDIATE')
 r=c.execute("SELECT * FROM leases WHERE resource='iam-publish'").fetchone()
 if r and r['until']>now().isoformat() and r['owner']!=owner:c.rollback();raise ValueError('IAM publish lease held by '+r['owner'])
 if renew and (not r or r['owner']!=owner or r['until']<now().isoformat()):c.rollback();raise ValueError('No active lease to renew')
 until=(now()+datetime.timedelta(minutes=30)).isoformat();c.execute("INSERT OR REPLACE INTO leases VALUES('iam-publish',?,?)",(owner,until));c.commit();return {'owner':owner,'until':until}
def renew_claim(c,campaign,domain,slug,token,owner):
 c.execute('BEGIN IMMEDIATE')
 r=c.execute('SELECT * FROM articles WHERE campaign=? AND domain=? AND slug=?',(campaign,domain,slug)).fetchone();g=c.execute("SELECT * FROM leases WHERE resource='iam-publish'").fetchone();stamp=now().isoformat()
 if not r or r['stage']!='claimed' or r['token']!=token or r['lease_until']<stamp or not g or g['owner']!=owner or g['until']<stamp:c.rollback();raise ValueError('Active exact article and global owner leases required')
 until=(now()+datetime.timedelta(minutes=30)).isoformat();c.execute('UPDATE articles SET lease_until=? WHERE campaign=? AND domain=? AND slug=?',(until,campaign,domain,slug));c.execute("UPDATE leases SET until=? WHERE resource='iam-publish' AND owner=?",(until,owner));c.commit();return {'renewed':True,'slug':slug,'until':until}
def amend(c,campaign,domain,slug,token,owner,patch,reason):
 if not reason or not patch or set(patch)-{'expectedTitle','publishedDate','requiredContact','contactControl'}:raise ValueError('Reason and permitted title/date/contact-only patch required; canonical immutable')
 c.execute('BEGIN IMMEDIATE');r=c.execute('SELECT * FROM articles WHERE campaign=? AND domain=? AND slug=?',(campaign,domain,slug)).fetchone();g=c.execute("SELECT * FROM leases WHERE resource='iam-publish'").fetchone();stamp=now().isoformat()
 if not r or r['stage']!='claimed' or r['token']!=token or r['lease_until']<stamp or not g or g['owner']!=owner or g['until']<stamp:c.rollback();raise ValueError('Active exact article/global owner lease required')
 payload=json.loads(r['payload']);payload.update(patch);e=json.loads(r['evidence'] or '{}');e.setdefault('amendments',[]).append({'at':stamp,'reason':reason,'fields':list(patch)})
 c.execute('UPDATE articles SET payload=?,evidence=? WHERE campaign=? AND domain=? AND slug=?',(json.dumps(payload),json.dumps(e),campaign,domain,slug));c.commit();return {'amended':True,'slug':slug,'payload':payload}
def claim(c,campaign,limit=1,owner='worker'):
 if not 1<=limit<=3:raise ValueError('claim size must be1..3')
 latest=c.execute("SELECT MAX(verified_at) AS v FROM articles WHERE campaign=? AND stage='verified'",(campaign,)).fetchone()['v']
 if latest and (now()-datetime.datetime.fromisoformat(latest)).total_seconds()<3600:return []
 lease(c,owner)
 c.execute('BEGIN IMMEDIATE')
 try:
  rows=c.execute("SELECT * FROM articles WHERE campaign=? AND (stage='planned' OR (stage='claimed' AND lease_until<?)) ORDER BY rowid LIMIT ?",(campaign,now().isoformat(),limit)).fetchall();out=[]
  for r in rows:
   if not json.loads(r['payload']).get('publishedDate'):raise ValueError('Set actual local release date in planned queue payload before claim')
   n=c.execute('SELECT n FROM attempts WHERE campaign=? AND domain=? AND slug=?',(campaign,r['domain'],r['slug'])).fetchone();n=(n['n'] if n else 0)+1
   if n>3:
    c.execute("UPDATE articles SET stage='blocked',evidence=? WHERE campaign=? AND domain=? AND slug=?",(json.dumps({'error':'Three attempts exhausted','nextAction':'Explicit recovery with reason required'}),campaign,r['domain'],r['slug']));continue
   duplicate=c.execute("SELECT slug FROM articles WHERE domain=? AND slug=? AND stage='verified'",(r['domain'],r['slug'])).fetchone()
   if duplicate:raise ValueError('duplicate published slug')
   c.execute('INSERT OR REPLACE INTO attempts VALUES(?,?,?,?)',(campaign,r['domain'],r['slug'],n))
   token=uuid.uuid4().hex;until=(now()+datetime.timedelta(minutes=30)).isoformat()
   c.execute("UPDATE articles SET stage='claimed',token=?,lease_until=? WHERE campaign=? AND domain=? AND slug=?",(token,until,campaign,r['domain'],r['slug']));out.append({**json.loads(r['payload']),'claimToken':token,'leaseUntil':until,'inspectActualCanonicalBeforePublishing':True,'attempt':n})
  c.commit();return out
 except Exception:c.rollback();raise
def record(c,campaign,domain,slug,token,e):
 r=c.execute('SELECT * FROM articles WHERE campaign=? AND domain=? AND slug=?',(campaign,domain,slug)).fetchone()
 if not r:raise ValueError('Unknown queued slug')
 if r['stage']=='verified':raise ValueError('duplicate published slug already verified')
 if r['stage']!='claimed' or r['token']!=token or r['lease_until']<now().isoformat():raise ValueError('Active exact claim required')
 if not e.get('passed') or not e.get('checks') or not e.get('checkedAt'):raise ValueError('Passing smoke evidence required')
 a=json.loads(r['payload']);checks=e['checks']
 if not all(x.get('passed') for x in checks):raise ValueError('failed acceptance')
 if {x.get('width') for x in checks}!={1440,390}:raise ValueError('desktop1440/phone390 required')
 if any(x.get('requestedUrl')!=a['canonical'] for x in checks):raise ValueError('Evidence must be for exact queued canonical')
 for key in ('commit','deployment'):
  if not e.get(key):raise ValueError('Missing release '+key)
 c.execute("UPDATE articles SET stage='verified',verified_at=?,evidence=?,token=NULL,lease_until=NULL WHERE campaign=? AND domain=? AND slug=?",(now().isoformat(),json.dumps(e),campaign,domain,slug));c.commit()
def report(c,campaign):
 rows=[dict(x) for x in c.execute('SELECT slug,stage,verified_at,lease_until,evidence FROM articles WHERE campaign=?',(campaign,))];n=sum(x['stage']=='verified' for x in rows)
 latest=max((x['verified_at'] for x in rows if x['verified_at']),default=None);due=(datetime.datetime.fromisoformat(latest)+datetime.timedelta(seconds=3600)).isoformat() if latest else None
 return {'nextDue':due,'campaign':campaign,'articles':rows,'remaining':sum(x['stage']!='verified' for x in rows),'complete':bool(rows) and all(x['stage']=='verified' for x in rows),'verifiedCount':n,'recheckEveryRun':True,'recheckAfterEveryThreeArticles':True}
def main():
 p=argparse.ArgumentParser();p.add_argument('action',choices=['preflight','claim','record','status','recent','blocked','lease','renew','release','recover','amend']);p.add_argument('--queue',required=True);p.add_argument('--db');p.add_argument('--owner',default='worker');p.add_argument('--reason');p.add_argument('--patch');p.add_argument('--limit',type=int,default=1);p.add_argument('--slug');p.add_argument('--token');p.add_argument('--evidence');a=p.parse_args();q=validate(json.loads(pathlib.Path(a.queue).read_text()));c=connect(a.db);seed(c,q)
 if a.action=='lease':out=lease(c,a.owner)
 elif a.action=='renew':
  if bool(a.slug)!=bool(a.token):raise ValueError('Both --slug and --token required to renew article')
  out=renew_claim(c,q['campaign'],q['domain'],a.slug,a.token,a.owner) if a.slug else lease(c,a.owner,True)
 elif a.action=='release':c.execute("DELETE FROM leases WHERE resource='iam-publish' AND owner=?",(a.owner,));c.commit();out={'released':True}
 elif a.action=='amend':out=amend(c,q['campaign'],q['domain'],a.slug,a.token,a.owner,json.loads(pathlib.Path(a.patch).read_text()),a.reason)
 elif a.action=='recover':
  if not a.reason:raise ValueError('Explicit recovery reason required')
  c.execute("UPDATE articles SET stage='planned',evidence=? WHERE campaign=? AND domain=? AND slug=? AND stage='blocked'",(json.dumps({'recoveryReason':a.reason}),q['campaign'],q['domain'],a.slug));c.execute('DELETE FROM attempts WHERE campaign=? AND domain=? AND slug=?',(q['campaign'],q['domain'],a.slug));c.commit();out=report(c,q['campaign'])
 elif a.action=='claim':out=claim(c,q['campaign'],a.limit,a.owner)
 elif a.action=='record':record(c,q['campaign'],q['domain'],a.slug,a.token,json.loads(pathlib.Path(a.evidence).read_text()));out=report(c,q['campaign'])
 elif a.action=='recent':out=[json.loads(x['payload']) for x in c.execute("SELECT payload FROM articles WHERE campaign=? AND stage='verified' ORDER BY verified_at DESC LIMIT 3",(q['campaign'],))]
 elif a.action=='blocked':
  e=json.loads(pathlib.Path(a.evidence).read_text());assert e.get('error') and e.get('nextAction'),'Exact blocker/nextAction required'
  r=c.execute('SELECT stage,token FROM articles WHERE campaign=? AND domain=? AND slug=?',(q['campaign'],q['domain'],a.slug)).fetchone()
  if not r or r['stage']!='claimed' or r['token']!=a.token:raise ValueError('Active claim required')
  c.execute("UPDATE articles SET stage='blocked',evidence=?,token=NULL,lease_until=NULL WHERE campaign=? AND domain=? AND slug=?",(json.dumps(e),q['campaign'],q['domain'],a.slug));c.commit();out=report(c,q['campaign'])
 else:out=report(c,q['campaign'])
 print(json.dumps(out,indent=2))
if __name__=='__main__':main()

"""Cheap read-only heartbeat gate. Publication still requires queue.py claim and full checks."""
import sqlite3,pathlib,datetime,json
r=pathlib.Path(__file__).resolve().parent
c=sqlite3.connect('file:'+str(r/'campaign.sqlite')+'?mode=ro',uri=True)
rows=c.execute('SELECT stage,verified_at FROM articles WHERE campaign=?',('construction-hourly-2026-10-27',)).fetchall();counts={}
for stage,_ in rows:counts[stage]=counts.get(stage,0)+1
last=max((datetime.datetime.fromisoformat(v.replace('Z','+00:00')) for _,v in rows if v),default=None)
now=datetime.datetime.now(datetime.timezone.utc);due=last+datetime.timedelta(seconds=3600)if last else now
print(json.dumps({'due':now>=due,'nextDue':due.isoformat(),'verified':counts.get('verified',0),'remaining':len(rows)-counts.get('verified',0)-counts.get('withdrawn',0),'activeTarget':len(rows)-counts.get('withdrawn',0),'withdrawn':counts.get('withdrawn',0),'claimed':counts.get('claimed',0),'complete':bool(rows)and counts.get('verified',0)+counts.get('withdrawn',0)==len(rows)}))

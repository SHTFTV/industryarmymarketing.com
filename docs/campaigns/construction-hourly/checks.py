"""Pre/post release checks; caller must stop publishing on nonzero exit."""
import argparse,json,pathlib,subprocess,datetime
import queue as workflow
ROOT=pathlib.Path(__file__).resolve().parent
NODE='/Users/kk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
def main():
 p=argparse.ArgumentParser();p.add_argument('--queue',required=True);p.add_argument('--phase',choices=['preflight','postrelease'],required=True);p.add_argument('--new-url',action='append',default=[]);p.add_argument('--db');a=p.parse_args();q=workflow.validate(json.loads(pathlib.Path(a.queue).read_text()));c=workflow.connect(a.db);workflow.seed(c,q)
 recent=[json.loads(x['payload'])['canonical'] for x in c.execute("SELECT payload FROM articles WHERE campaign=? AND stage='verified' ORDER BY verified_at DESC LIMIT 3",(q['campaign'],))];urls=list(dict.fromkeys(a.new_url+recent))
 if a.phase=='postrelease' and not a.new_url:raise ValueError('Postrelease requires newest --new-url')
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ');d=ROOT/'checks'/stamp;d.mkdir(parents=True,exist_ok=True);u=d/'urls.json';u.write_text(json.dumps(urls));out=d/'result.json'
 if urls:
  r=subprocess.run([NODE,str(ROOT/'smoke.cjs'),'--queue',str(pathlib.Path(a.queue).resolve()),'--urls',str(u),'--output',str(out)])
  code=r.returncode
 else:out.write_text(json.dumps({'passed':True,'checks':[],'note':'No prior verified releases; structural queue preflight only.'}));code=0
 result=json.loads(out.read_text())
 for url in a.new_url:
  selected=[x for x in result.get('checks',[]) if x.get('requestedUrl')==url];part={'checkedAt':result.get('checkedAt'),'passed':bool(selected) and all(x.get('passed') for x in selected),'checks':selected}
  article=next((x for x in q['articles'] if x['canonical']==url),None)
  if article:(d/(article['slug']+'-evidence.json')).write_text(json.dumps(part,indent=2))
 c.execute('INSERT INTO runs VALUES(?,?,?,?,?)',(q['campaign'],stamp,a.phase,'passed' if code==0 else 'held',str(out)));c.commit()
 print(json.dumps({'phase':a.phase,'status':'passed' if code==0 else 'HELD','evidence':str(out),'nextAction':None if code==0 else 'Stop publication; inspect exact failed checks, repair or explicitly record blocker. Do not mark verified.'}));raise SystemExit(code)
if __name__=='__main__':main()

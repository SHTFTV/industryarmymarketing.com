import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {createServer} from 'vite';
const root=process.cwd(),dist=path.join(root,'dist');
const journal=JSON.parse(fs.readFileSync(path.join(root,'src/data/buildJournal.json'),'utf8'));
const markets=JSON.parse(fs.readFileSync(path.join(root,'src/data/seoMarkets.json'),'utf8'));
const template=fs.readFileSync(path.join(dist,'index.html'),'utf8');
globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
try {
 const {render}=await server.ssrLoadModule('/src/journal-prerender.tsx');
 const {blogPosts}=await server.ssrLoadModule('/src/data/blogPosts.ts');
 const {homepageJournal}=await server.ssrLoadModule('/src/lib/homepageJournal.mjs');
 const cardKeys=['slug','title','brand','category','publishedAt','date','image','imageAlt','excerpt','pain'];
 fs.writeFileSync(path.join(dist,'journal-index.json'),JSON.stringify({schemaVersion:1,posts:homepageJournal(blogPosts).map(p=>Object.fromEntries(cardKeys.filter(k=>p[k]!==undefined).map(k=>[k,p[k]])))}));
 const imageCorrections=JSON.parse(fs.readFileSync(path.join(root,'../../operations/iam/image-correction-receipts.json'),'utf8'));
 const publisherState=JSON.parse(fs.readFileSync(path.join(root,'../../operations/iam/state.json'),'utf8'));
 const postBySlug=new Map(homepageJournal(blogPosts).map(p=>[p.slug,p]));
 const receiptEvents=new Map();
 for(const receipt of publisherState.receipts??[]){
  const p=postBySlug.get(receipt.slug),row=publisherState.rows?.[receipt.slug];
  if(!p||row?.status==="withdrawn"||!Number.isFinite(Date.parse(receipt.verifiedAt))||!Number.isFinite(Date.parse(p.publishedAt))||(receipt.productionVerified!==true&&row?.status!=='verified'))continue;
  const event={id:'industryarmymarketing.com:'+p.slug,site:'industryarmymarketing.com',status:'done',title:p.title,url:'https://www.industryarmymarketing.com/blog/'+p.slug,publishedAt:p.publishedAt,verifiedAt:receipt.verifiedAt,checkedAt:receipt.verifiedAt,featuredImageUrl:'https://www.industryarmymarketing.com'+p.image,featuredImageCredit:p.imageAlt??null,featuredImageType:/original AI/i.test(p.imageAlt??'')?'ai-illustration':/screenshot|website|preview/i.test(p.imageAlt??'')?'website-screenshot':'unknown',featuredImageStatus:imageCorrections.receipts.some(r=>r.image===p.image&&r.desktopVerified&&r.phoneVerified&&r.upscaled===false&&r.dimensions?.[0]===1600&&r.dimensions?.[1]===900&&r.sha256===crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'public',r.image))).digest('hex'))?'verified':'unknown',runUrl:receipt.runUrl??null,runTrigger:receipt.trigger??'unknown',sotVersion:receipt.rules?.sotVersion??null,policyVersion:null,receiptState:'publisher-verified-publication'};
  const old=receiptEvents.get(p.slug);if(!old||Date.parse(old.verifiedAt)<Date.parse(event.verifiedAt))receiptEvents.set(p.slug,event);
 }
 fs.writeFileSync(path.join(dist,'publication-results.json'),JSON.stringify({schemaVersion:1,events:[...receiptEvents.values()].sort((a,b)=>Date.parse(a.publishedAt)-Date.parse(b.publishedAt)),scope:'Actual retained sole-publisher verification receipts; legacy articles without receipts are not fabricated as newly verified.',imageNote:'Image URL/credit comes from current canonical content; current visual compliance is checked separately.'}));

 for(const route of ['/', '/eyespyr', '/contractors', '/snow-removal-marketing', '/steel-stud-drywall-marketing', '/mission', '/blog', '/brand-creation-management-vancouver','/seo','/seo/united-states',...markets.map(m=>'/seo/'+m.slug),...journal.map(p=>'/blog/'+p.slug)]) {
  const {html,head}=render(route);
  const headHtml=['title','meta','link','script'].map(k=>head?.[k]?.toString()||'').join('');
  let page=template.replace(/<title>[\s\S]*?<\/title>/,'').replace(/<meta\b[^>]*(?:name="description"|property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/g,'').replace(/<link\b[^>]*rel="canonical"[^>]*>/g,'');
  page=page.replace('</head>',headHtml+'</head>');
  page=page.replace('<div id="root"></div>','<div id="root">'+html+'</div>');
  const target=route==='/'?path.join(dist,'index.html'):path.join(dist,route,'index.html');
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,page);
  if(route!=='/') fs.writeFileSync(path.join(dist,route+'.html'),page);
 }
 let sitemap=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
 if(!sitemap.includes('https://www.industryarmymarketing.com/brand-creation-management-vancouver'))sitemap=sitemap.replace('</urlset>','<url><loc>https://www.industryarmymarketing.com/brand-creation-management-vancouver</loc></url></urlset>');
 for(const route of ['/eyespyr','/contractors','/snow-removal-marketing', '/steel-stud-drywall-marketing','/mission','/seo','/seo/united-states',...markets.map(m=>'/seo/'+m.slug)]){const u='https://www.industryarmymarketing.com'+route;if(!sitemap.includes('<loc>'+u+'</loc>'))sitemap=sitemap.replace('</urlset>',`<url><loc>${u}</loc></url></urlset>`);}
 for(const p of journal) {const u='https://www.industryarmymarketing.com/blog/'+p.slug;if(!sitemap.includes(u))sitemap=sitemap.replace('</urlset>',`<url><loc>${u}</loc><lastmod>${p.publishedAt.slice(0,10)}</lastmod></url></urlset>`);}
 fs.writeFileSync(path.join(dist,'sitemap.xml'),sitemap);
 let rss=fs.readFileSync(path.join(dist,'rss.xml'),'utf8');
 const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 const items=journal.filter(p=>!rss.includes('/blog/'+p.slug)).map(p=>`<item><title>${esc(p.title)}</title><link>https://www.industryarmymarketing.com/blog/${p.slug}</link><guid>https://www.industryarmymarketing.com/blog/${p.slug}</guid><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate><description>${esc(p.excerpt)}</description></item>`).join('');
 rss=rss.replace('<item>',items+'<item>');fs.writeFileSync(path.join(dist,'rss.xml'),rss);
 fs.writeFileSync(path.join(dist,'source-version.json'),JSON.stringify({schemaVersion:1,repository:'SHTFTV/industryarmymarketing.com',sourceCommit:process.env.VERCEL_GIT_COMMIT_SHA||process.env.GITHUB_SHA||null,sotSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'../../docs/IAM-SOT.md'))).digest('hex'),journalSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'src/data/buildJournal.json'))).digest('hex')})+'\n');
 console.log('Prerendered IAM homepage, blog and '+journal.length+' build-journal articles.');
} finally {await server.close();}



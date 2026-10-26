import fs from 'node:fs';
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
 for(const route of ['/', '/snow-removal-marketing', '/mission', '/blog', '/brand-creation-management-vancouver','/seo','/seo/united-states',...markets.map(m=>'/seo/'+m.slug),...journal.map(p=>'/blog/'+p.slug)]) {
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
 for(const route of ['/snow-removal-marketing','/mission','/seo','/seo/united-states',...markets.map(m=>'/seo/'+m.slug)]){const u='https://www.industryarmymarketing.com'+route;if(!sitemap.includes('<loc>'+u+'</loc>'))sitemap=sitemap.replace('</urlset>',`<url><loc>${u}</loc></url></urlset>`);}
 for(const p of journal) {const u='https://www.industryarmymarketing.com/blog/'+p.slug;if(!sitemap.includes(u))sitemap=sitemap.replace('</urlset>',`<url><loc>${u}</loc><lastmod>${p.publishedAt.slice(0,10)}</lastmod></url></urlset>`);}
 fs.writeFileSync(path.join(dist,'sitemap.xml'),sitemap);
 let rss=fs.readFileSync(path.join(dist,'rss.xml'),'utf8');
 const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 const items=journal.filter(p=>!rss.includes('/blog/'+p.slug)).map(p=>`<item><title>${esc(p.title)}</title><link>https://www.industryarmymarketing.com/blog/${p.slug}</link><guid>https://www.industryarmymarketing.com/blog/${p.slug}</guid><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate><description>${esc(p.excerpt)}</description></item>`).join('');
 rss=rss.replace('<item>',items+'<item>');fs.writeFileSync(path.join(dist,'rss.xml'),rss);
 console.log('Prerendered IAM homepage, blog and '+journal.length+' build-journal articles.');
} finally {await server.close();}

// Presentation only: never edits a source publication timestamp or substitutes updated/build time.
export function homepageJournal(posts,now=Date.now()){
 const seen=new Set();return posts.filter(p=>p&&typeof p.slug==='string'&&typeof p.title==='string'&&typeof p.image==='string'&&p.is_published!==false&&!['draft','held','blocked','withdrawn'].includes(p.publicationStatus??p.status)&&Number.isFinite(Date.parse(p.publishedAt))&&Date.parse(p.publishedAt)<=now).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||(a.slug<b.slug?-1:a.slug>b.slug?1:0)).filter(p=>{if(seen.has(p.slug))return false;seen.add(p.slug);return true;});
}
export function homepagePublicationLabel(publishedAt){if(!publishedAt||!Number.isFinite(Date.parse(publishedAt)))return 'Publication date unavailable';return new Intl.DateTimeFormat('en-US',{timeZone:'America/Vancouver',year:'numeric',month:'long',day:'numeric'}).format(new Date(publishedAt));}

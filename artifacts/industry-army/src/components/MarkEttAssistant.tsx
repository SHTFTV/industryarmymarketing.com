import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "./mark-ett-assistant.css";

type Message={role:"user"|"assistant";content:string};
const hello="I'm Mark Ett, IAM's AI Intelligence Officer. Ask about branding, websites, apps, SEO or finding your place in the network. What are you building?";
function Reply({text}:{text:string}) {
  return <>{text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part,i)=>{const m=part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);if(m&&(/^\/[a-z0-9/?=&_-]*$/i.test(m[2])||m[2]==='mailto:colin@industryarmymarketing.com'))return <a key={i} href={m[2]}>{m[1]}</a>;return <span key={i}>{part}</span>;})}</>;
}
export default function MarkEttAssistant(){
 const [open,setOpen]=useState(false),[messages,setMessages]=useState<Message[]>([]),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const input=useRef<HTMLTextAreaElement>(null),launcher=useRef<HTMLButtonElement>(null),log=useRef<HTMLDivElement>(null),abort=useRef<AbortController|null>(null);
 useEffect(()=>()=>abort.current?.abort(),[]);
 useEffect(()=>{if(open)input.current?.focus();},[open]);
 useEffect(()=>{if(open&&log.current)log.current.scrollTop=log.current.scrollHeight;},[messages,busy,open]);
 function close(){setOpen(false);launcher.current?.focus();}
 async function send(text:string){
  if(busy||!text.trim())return;
  if(messages.length>=12){setError('Start a new conversation to keep chatting, or contact IAM.');return;}
  const next:Message[]=[...messages,{role:'user',content:text.trim()}];setMessages(next);setDraft('');setError('');setBusy(true);
  const controller=new AbortController();abort.current=controller;const timeout=setTimeout(()=>controller.abort(),28000);
  try{const res=await fetch('/api/mark-ett',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next}),signal:controller.signal});const data=await res.json().catch(()=>({error:"Mark Ett is temporarily unavailable. Please try again or contact IAM."}));if(!res.ok||!data.reply)throw new Error(data.error||'Mark Ett is unavailable. Please try again.');setMessages([...next,{role:'assistant',content:data.reply}]);}
  catch(e){setMessages(messages);setDraft(text);setError(e instanceof Error&&e.name!=='AbortError'?e.message:'The reply took too long. Try again or contact IAM.');}
  finally{clearTimeout(timeout);setBusy(false);abort.current=null;input.current?.focus();}
 }
 function submit(e:FormEvent){e.preventDefault();void send(draft);}
 return <aside className="iam-mark-ett" aria-label="Mark Ett AI assistant">
  {open?<section id="mark-ett-panel" className="iam-mark-panel" role="dialog" aria-modal="false" aria-labelledby="mark-ett-heading" onKeyDown={e=>{if(e.key==='Escape')close();}}>
   <header><img src="/mark-ett/officer.webp" width={56} height={64} alt="Mark Ett illustrated officer"/><div><h2 id="mark-ett-heading">Mark Ett</h2><p>IAM Intelligence Officer · AI assistant</p></div><button type="button" onClick={close} aria-label="Close Mark Ett chat">×</button></header>
   <div className="iam-mark-log" ref={log} role="log" aria-live="polite" aria-relevant="additions"><p className="iam-mark-message assistant"><strong>Mark Ett</strong>{hello}</p>{messages.map((m,i)=><p key={i} className={'iam-mark-message '+m.role}><strong>{m.role==='assistant'?'Mark Ett':'You'}</strong><Reply text={m.content}/></p>)}{busy?<p className="iam-mark-status" role="status">Mark Ett is preparing a reply…</p>:null}</div>
   {messages.length===0?<div className="iam-mark-prompts">{['Help me build a brand','What can IAM do for my website?','Tell me about Vancouver SEO'].map(p=><button key={p} type="button" disabled={busy} onClick={()=>void send(p)}>{p} ↗</button>)}</div>:null}
   <p className="iam-mark-privacy">Messages go to our AI provider for a reply. Avoid private or sensitive information. This chat does not submit an enquiry to Colin.</p>
   {error?<p className="iam-mark-error" role="alert">{error} <Link to="/contact?request=branding">Contact IAM →</Link></p>:null}
   <form onSubmit={submit}><label className="sr-only" htmlFor="mark-ett-message">Your message to Mark Ett</label><textarea ref={input} id="mark-ett-message" value={draft} maxLength={2000} onChange={e=>setDraft(e.target.value)} placeholder="What are you building?" rows={2} disabled={busy} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send(draft);}}}/><button type="submit" disabled={busy||!draft.trim()}>Send</button></form>
   <footer><button type="button" disabled={busy} onClick={()=>{setMessages([]);setError('');setDraft('');input.current?.focus();}}>New chat</button><Link to="/contact?request=branding">Talk to Colin ↗</Link><span>AI can make mistakes.</span></footer>
  </section>:null}
  <button ref={launcher} type="button" className="iam-mark-launch" aria-expanded={open} aria-controls={open?'mark-ett-panel':undefined} onClick={()=>open?close():setOpen(true)}><img src="/mark-ett/officer.webp" alt="" width={46} height={54}/><span>{open?'Close chat':'Ask Mark Ett'}<small>IAM intelligence · AI</small></span></button>
 </aside>;
}

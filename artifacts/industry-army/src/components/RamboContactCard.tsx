import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Mail, MessageSquare, Pause, Phone, Play, Star, X } from 'lucide-react';

export const RAMBO_GOOGLE_URL = 'https://www.google.com/maps?cid=12643128656142868159';

export default function RamboContactCard() {
  const [open, setOpen] = useState(true);
  const [paused, setPaused] = useState(false);
  const reopen = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);

  if (!open) return <button ref={reopen} type="button" className="rambo-contact-reopen" onClick={() => setOpen(true)} aria-label="Open Rambo contact card"><img src="https://www.rambowalls.com/brand-motion/rambo-r-transparent.png" width="28" height="28" alt="" />Contact Rambo</button>;

  return <aside className={`rambo-contact-card${paused ? ' rambo-contact-paused' : ''}`} aria-label="Contact Rambo Wall and Ceiling Limited" data-testid="rambo-contact-card">
    <button type="button" className="rambo-contact-close" aria-label="Hide Rambo contact card" onClick={() => { setOpen(false); requestAnimationFrame(() => reopen.current?.focus()); }}><X size={16} aria-hidden="true" /></button>
    <div className="rambo-contact-heading">
      <div className="rambo-contact-logo" role="img" aria-label="Animated Rambo R badge and safety vest">
        <div className="rambo-logo-turn"><div className="rambo-logo-face rambo-logo-front"><img src="https://www.rambowalls.com/brand-motion/rambo-r-transparent.png" width="2048" height="2048" alt="" /></div><div className="rambo-logo-face rambo-logo-back"><img src="https://www.rambowalls.com/brand-motion/rambo-vest-transparent.png" width="2048" height="2048" alt="" /></div></div>
      </div>
      <div><p className="rambo-contact-brand">Rambo Wall &amp; Ceiling</p><p className="rambo-contact-title">Let’s build your project.</p></div>
    </div>
    <div className="rambo-contact-actions">
      <a className="rambo-contact-call" href="tel:+17787732790"><Phone size={18} aria-hidden="true" /><span><small>Call now</small><strong>778-773-2790</strong></span></a>
      <a href="sms:+17789547555"><MessageSquare size={18} aria-hidden="true" /><span><small>Text Rambo</small><strong>778-954-7555</strong></span></a>
      <a href="mailto:rambowallceiling@gmail.com"><Mail size={18} aria-hidden="true" /><span><small>Email</small><strong className="rambo-contact-email">rambowallceiling@gmail.com</strong></span></a>
      <a href={RAMBO_GOOGLE_URL} target="_blank" rel="noopener noreferrer" aria-label="View Rambo Wall and Ceiling Limited on Google"><Star size={18} className="rambo-contact-star" aria-hidden="true" /><strong>Find us on Google</strong><ExternalLink size={14} className="rambo-contact-external" aria-hidden="true" /></a>
    </div>
    <button type="button" className="rambo-contact-motion" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}{paused ? 'Play logo' : 'Pause logo'}</button>
  </aside>;
}

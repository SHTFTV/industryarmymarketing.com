import { useEffect, useRef, useState } from "react";
import "./brand-studio.css";

export function IamStoryFilm() {
  return <section id="iam-story" className="iam-story-archive"><div className="iam-story-film"><div><p className="iam-studio-kicker">The story behind the work</p><h2>Built from the industries<br/>we work in.</h2><p>Watch the original IAM story, then follow the Build Journal for the brands, products and releases taking shape now.</p><a href="/blog">Read the Build Journal →</a></div><div className="iam-story-player"><iframe src="https://www.youtube.com/embed/JhZLiYdoaJA" title="The Story of IAM — How We Turned Trades Into a Digital Army" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div></div></section>;
}

export default function HeroSection() {
  const [playing, setPlaying] = useState(false);
  const hero = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  useEffect(() => { const element=film.current; if (!element) return; if (playing) void element.play().catch(() => setPlaying(false)); else element.pause(); }, [playing]);
  useEffect(() => {
    const element = hero.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle("iam-hero-visible", entry.isIntersecting);
    }, {threshold: 0});
    observer.observe(element);
    return () => { observer.disconnect(); document.body.classList.remove("iam-hero-visible"); };
  }, []);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPlaying(!preference.matches && !document.hidden);
    const visibility = () => { if (document.hidden) setPlaying(false); };
    update(); preference.addEventListener("change", update); document.addEventListener("visibilitychange", visibility);
    return () => { preference.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <section ref={hero} id="home" className="iam-studio-hero iam-network-hero iam-film-hero">
    <video ref={film} className="iam-industry-army-film" muted loop playsInline preload="metadata" poster="/brand-journal/iam-industry-army-poster.jpg" aria-label="One IAM army character multiplies into matching construction, healthcare, transport, electrical and agriculture workers"><source src="/brand-journal/iam-industry-army-v1.mp4" type="video/mp4"/></video>
    <div className="iam-network-hero-layout"><div className="iam-studio-intro">
      <img className="iam-studio-seal" src="/brand-journal/iam-seal.webp" width={100} height={100} alt="Industry Army Marketing" fetchPriority="high"/>
      <p className="iam-studio-kicker">A CONNECTED BRAND & SEARCH ECOSYSTEM · EST. 2011</p>
      <h1>Industry Army<br/><span>Marketing.</span></h1>
      <h2 className="iam-army-promise">Join your industry and have an army working with you.</h2>
      <p className="iam-studio-lead">Build your presence city by city with IAM’s pSEO ecosystem, industry brands and connected publishing. Bring us your expertise and target cities; we shape an agreed content and marketing plan to help your business reach the people it serves.</p>
      <p className="iam-army-price">From $10 a month · For approved businesses</p>
      <div className="iam-studio-actions"><a href="/contact?request=network">Apply for your industry and city ↗</a><a className="iam-studio-secondary" href="/brand-creation-management-vancouver">Branding & SEO services ↗</a></div>
      <p className="iam-studio-signoff">Industry Army Marketing · Established November 18, 2011 <span>WE MAKE BUSINESS BOOM.</span></p>
      <p className="iam-studio-signoff">Annual directory-only registration is a separate offer. <a href="/pricing">Compare participation options →</a></p>
      <button type="button" className="iam-film-control" onClick={() => setPlaying(value => !value)} aria-pressed={playing}>{playing ? "Pause background video" : "Play background video"}</button>
    </div></div>
  </section>;
}

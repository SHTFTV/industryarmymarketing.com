import { useEffect, useRef, useState } from "react";
import "./brand-studio.css";
import "./iam-home-opening.css";

export function IamStoryFilm() {
  return <section id="iam-story" className="iam-story-archive"><div className="iam-story-film"><div><p className="iam-studio-kicker">The story behind the work</p><h2>Built from the industries<br/>we work in.</h2><p>Watch the original IAM story, then follow the Build Journal for the brands, products and releases taking shape now.</p><a href="/blog">Read the Build Journal →</a></div><div className="iam-story-player"><iframe src="https://www.youtube.com/embed/JhZLiYdoaJA" title="The Story of IAM — How We Turned Trades Into a Digital Army" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div></div></section>;
}

export default function HeroSection() {
  const [playing, setPlaying] = useState(false);
  const [industry, setIndustry] = useState("Your industry’s army");
  const syncIndustry = (time: number) => {
    const names = ["Your industry’s army", "Healthcare", "Construction", "Transportation", "Professional Services"];
    setIndustry(time >= 18.4 ? "Find your industry" : names[Math.floor((time + 0.4) / 4) % names.length]);
  };
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
  return <section ref={hero} id="home" className="iam-home-hero">
    <div className="iam-home-hero-grid"><div className="iam-home-motion">
      <video ref={film} onTimeUpdate={event => syncIndustry(event.currentTarget.currentTime)} className="iam-home-crew-film" muted loop playsInline preload="metadata" poster="/brand-journal/iam-general-mark-poster-v4.jpg" aria-label="General Mark and the IAM crew changing between army, healthcare, construction, transport and professional uniforms"><source src="/brand-journal/iam-general-mark-army-v5.mp4" type="video/mp4"/></video>
      <img className="iam-home-seal" src="/brand-journal/iam-seal.webp" width={100} height={100} alt="Industry Army Marketing" fetchPriority="high"/>
      <div className="iam-home-crew-label"><span>YOUR INDUSTRY’S ARMY</span><strong>{industry}</strong></div>
      <button type="button" className="iam-home-film-control" onClick={() => setPlaying(value => !value)} aria-pressed={playing}>{playing ? "Pause crew video" : "Play crew video"}</button>
    </div><div className="iam-home-intro"><p className="iam-home-eyebrow">INDUSTRY ARMY MARKETING · EST. 2011</p><h1>Your industry.<br/>Your city.<br/><span>Your army.</span></h1><p className="iam-home-promise">Put your expertise<br/>in front of the right people.</p><p className="iam-home-lead">Your brand, real projects and useful city pages—connected through IAM’s industry network and pSEO system.</p><div className="iam-home-actions"><a href="#iam-industry-doors">Find your industry ↗</a><a href="#iam-pseo">See how pSEO works ↓</a></div><p className="iam-home-price">Marketing participation from $10/month for approved businesses. <a href="/pricing">Compare the options →</a></p></div></div>
    <div className="iam-home-signal"><span>BRAND</span><b>+</b><span>YOUR WORK</span><b>+</b><span>YOUR CITY</span><b>→</b><strong>More ways to be found.</strong></div>
  </section>;
}

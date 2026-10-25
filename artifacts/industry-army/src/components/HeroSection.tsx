import { useEffect, useRef } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import "./brand-studio.css";

export function IamStoryFilm() {
  return <section id="iam-story" className="iam-story-archive"><div className="iam-story-film"><div><p className="iam-studio-kicker">The story behind the work</p><h2>Built from the industries<br/>we work in.</h2><p>Watch the original IAM story, then follow the Build Journal for the brands, products and releases taking shape now.</p><a href="/blog">Read the Build Journal →</a></div><div className="iam-story-player"><iframe src="https://www.youtube.com/embed/JhZLiYdoaJA" title="The Story of IAM — How We Turned Trades Into a Digital Army" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div></div></section>;
}

export default function HeroSection() {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => { if (preference.matches) element.pause(); else void element.play().catch(() => {}); };
    const visibility = () => { if (document.hidden) element.pause(); };
    applyPreference();
    preference.addEventListener("change", applyPreference);
    document.addEventListener("visibilitychange", visibility);
    return () => { preference.removeEventListener("change", applyPreference); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <section id="home" className="iam-studio-hero iam-network-hero">
    <img className="iam-studio-backdrop" src={heroBg} alt="" width={1920} height={1080}/><div className="iam-studio-veil"/>
    <div className="iam-network-hero-layout"><div className="iam-studio-intro">
      <img className="iam-studio-seal" src="/brand-journal/iam-seal.webp" width={100} height={100} alt="Industry Army Marketing" fetchPriority="high"/>
      <p className="iam-studio-kicker">Branding · Websites · Apps · Marketing</p>
      <h1>Brands we build.<br/><span>Networks you can join.</span></h1>
      <p className="iam-studio-lead">IAM creates and markets industry brands, websites and apps. Bring your business into a relevant network, share your expertise, or work with us on a brand of your own.</p>
      <div className="iam-studio-actions"><a href="#flagship-brands">Find your brand network ↓</a><a className="iam-studio-secondary" href="/contact?request=branding">Build with IAM ↗</a></div>
      <p className="iam-studio-signoff">Industry Army Marketing <span>WE MAKE BUSINESS BOOM.</span></p>
    </div><figure className="iam-brand-reel"><video ref={video} controls muted loop playsInline preload="metadata" poster="/brand-journal/iam-brands-reel-poster.jpg" aria-label="IAM brand showcase: Kong Tractors, PlowWow, Love Our Listings, Dentists.ltd, Roofers.io, Weddings.io and Treatments.tv"><source src="/brand-journal/iam-brands-reel.mp4" type="video/mp4"/></video><figcaption>IAM brand showcase · Existing brand artwork, including illustrated concepts. Silent loop; pause or play using the video controls. <a href="#iam-story">Watch the original IAM story →</a></figcaption></figure></div>
  </section>;
}

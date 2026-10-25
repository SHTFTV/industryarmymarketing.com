import heroBg from "@/assets/hero-bg.jpg";
import "./brand-studio.css";

export default function HeroSection() {
  return <section id="home" className="iam-studio-hero">
    <img className="iam-studio-backdrop" src={heroBg} alt="" width={1920} height={1080}/>
    <div className="iam-studio-veil"/>
    <div className="iam-studio-intro">
      <img className="iam-studio-seal" src="/brand-journal/iam-seal.webp" width={140} height={140} alt="Industry Army Marketing" fetchPriority="high"/>
      <p className="iam-studio-kicker">Brand strategy · Identity · Websites · Apps · Rollout</p>
      <h1>We build the brand.<br/><span>Then put it to work.</span></h1>
      <p className="iam-studio-lead">A name people remember. A look they recognise. A website or app with a job to do. IAM brings the pieces together—and shows the work as it goes live.</p>
      <div className="iam-studio-actions"><a href="/contact?request=branding">Let’s build your brand ↗</a><a className="iam-studio-secondary" href="#work">Explore the work ↓</a></div>
      <p className="iam-studio-signoff">Industry Army Marketing <span>WE MAKE BUSINESS BOOM.</span></p>
    </div>
    <div className="iam-story-film"><div><p className="iam-studio-kicker">The story behind the work</p><h2>Built from the industries<br/>we work in.</h2><p>Keep the original IAM story in view. Then follow the journal for the brands, products and public releases taking shape now.</p><a href="/blog">Read the Build Journal →</a></div><div className="iam-story-player"><iframe src="https://www.youtube.com/embed/JhZLiYdoaJA" title="The Story of IAM — How We Turned Trades Into a Digital Army" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div></div>
  </section>;
}

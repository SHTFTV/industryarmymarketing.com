import { Link } from "react-router-dom";

const cols = [
  {
    title: "Platform",
    links: [
      { label: "Domain Network", to: "/network" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Pricing", to: "/pricing" },
      { label: "SEO Packages", to: "/seo-packages" },
      { label: "Free Scan", to: "/scan-wizard" },
      { label: "EyeSpyr", to: "/eyespyr" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Site Builder", to: "/builder" },
      { label: "Investors", to: "/investors" },
      { label: "Blog", to: "/blog" },
      { label: "Contractors", to: "/contractors" },
      { label: "Apply as a Contractor", to: "/apply/contractors" },
      { label: "Service Pros", to: "/service-professionals" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Backlinks", to: "/backlinks" },
      { label: "Guest Post", to: "/guest-post" },
      { label: "Industries", to: "/industries" },
      { label: "Dofollow Network", to: "/dofollow-backlinks" },
      { label: "Legal Hub", to: "/legal" },
      { label: "Contact", to: "/contact" },
      { label: "Sitemap", to: "/sitemap" },
      { label: "RSS Feed", to: "/rss.xml", external: true },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="font-display text-3xl text-primary text-glow tracking-wider">IAM</Link>
          <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
            Industry Army Marketing. Own your city. Lock out your competition.
            150+ premium domains. 20+ years of authority.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-foreground font-semibold uppercase tracking-widest text-xs mb-4">{c.title}</p>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  {"external" in l && l.external ? (
                    <a
                      href={l.to}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.to} className="text-muted-foreground hover:text-primary text-sm transition-colors">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} Industry Army Marketing · Vancouver, BC</p>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">The $10 Marketing Revolution · Est. 2011</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

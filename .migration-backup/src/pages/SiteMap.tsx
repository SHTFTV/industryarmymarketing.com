import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import Seo from "@/components/Seo";
import PageHeader from "@/components/PageHeader";
import { breadcrumbList } from "@/lib/breadcrumb";

interface SitemapLink {
  label: string;
  to: string;
  external?: boolean;
}

interface SitemapGroup {
  title: string;
  links: SitemapLink[];
}

const groups: SitemapGroup[] = [
  {
    title: "Core",
    links: [
      { label: "Home", to: "/" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Pricing", to: "/pricing" },
      { label: "Contact", to: "/contact" },
      { label: "Legal Hub", to: "/legal" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Domain Network", to: "/network" },
      { label: "EyeSpyr Verification", to: "/eyespyr" },
      { label: "Free Scan", to: "/scan-wizard" },
      { label: "SEO Audit", to: "/seo-audit" },
      { label: "Site Builder", to: "/builder" },
      { label: "Investors", to: "/investors" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Contractors", to: "/contractors" },
      { label: "Service Professionals", to: "/service-professionals" },
      { label: "Industries", to: "/industries" },
      { label: "Backlinks", to: "/backlinks" },
      { label: "Dofollow Backlinks", to: "/dofollow-backlinks" },
      { label: "Guest Post", to: "/guest-post" },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Blog", to: "/blog" },
      { label: "Weddings Ecosystem", to: "/weddings-ecosystem" },
      { label: "Steel Stud Niche", to: "/niches/steel-stud" },
      { label: "Mining Logistics Niche", to: "/niches/mining-logistics" },
      { label: "RSS Feed", to: "/rss.xml", external: true },
      { label: "XML Sitemap", to: "/sitemap.xml", external: true },
    ],
  },
  {
    title: "Local",
    links: [
      { label: "Vancouver", to: "/local/vancouver" },
      { label: "Surrey", to: "/local/surrey" },
      { label: "Langley", to: "/local/langley" },
    ],
  },
];

const SiteMap = () => (
  <Layout>
    <Seo
      title="Sitemap | Industry Army Marketing"
      description="HTML sitemap of every primary page on the Industry Army Marketing site — core pages, platform tools, services, content, and local territories."
      path="/sitemap"
      jsonLd={breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Sitemap", path: "/sitemap" },
      ])}
    />
    <PageHeader
      eyebrow="Site Index"
      title="Full"
      highlight="Sitemap"
      description="A human-readable index of the pages on industryarmymarketing.com. For crawlers, see /sitemap.xml."
    />
    <section className="container mx-auto px-4 pb-24">
      <nav aria-label="Site pages" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="text-foreground font-semibold uppercase tracking-widest text-xs mb-4">
              {g.title}
            </h2>
            <ul className="space-y-2">
              {g.links.map((l) => (
                <li key={l.to}>
                  {l.external ? (
                    <a
                      href={l.to}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      to={l.to}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </section>
  </Layout>
);

export default SiteMap;
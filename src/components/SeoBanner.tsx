// Bump this whenever /public/CONTRACTOR_SEO.png is replaced.
// The query string forces browsers, CDNs, and crawlers to fetch the new asset
// without waiting for cache TTLs to expire.
export const SEO_BANNER_VERSION = "v=2026-06-20";
export const SEO_BANNER_SRC = `/CONTRACTOR_SEO.png?${SEO_BANNER_VERSION}`;

const SeoBanner = ({ alt }: { alt: string }) => (
  <div
    data-testid="seo-banner"
    className="w-full border-b border-border bg-background"
  >
    <img
      src={SEO_BANNER_SRC}
      alt={alt}
      width={1000}
      height={600}
      fetchPriority="high"
      loading="eager"
      decoding="async"
      className="block w-full h-auto object-cover max-h-[420px]"
    />
  </div>
);

export default SeoBanner;
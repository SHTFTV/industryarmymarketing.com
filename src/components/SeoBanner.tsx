const SeoBanner = ({ alt }: { alt: string }) => (
  <div className="w-full border-b border-border bg-background">
    <img
      src="/CONTRACTOR_SEO.png"
      alt={alt}
      fetchPriority="high"
      loading="eager"
      decoding="async"
      className="block w-full h-auto object-cover max-h-[420px]"
    />
  </div>
);

export default SeoBanner;
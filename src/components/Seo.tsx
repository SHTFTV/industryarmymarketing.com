import { Helmet } from "react-helmet-async";

export const SITE_URL = "https://industryarmymarketing.com";

const toAbsolute = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

interface SeoProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  jsonLd?: object | object[];
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

const Seo = ({
  title,
  description,
  path,
  type = "website",
  jsonLd,
  image = "/og-image.jpg",
  imageAlt = "Industry Army Marketing — $10 SEO. 20+ years of authority.",
  noindex = false,
  locale = "en_CA",
  publishedTime,
  modifiedTime,
  author,
  section,
}: SeoProps) => {
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const absoluteUrl = toAbsolute(path);
  const absoluteImage = toAbsolute(image);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={absoluteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:locale" content={locale} />
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {type === "article" && section && (
        <meta property="article:section" content={section} />
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={absoluteUrl} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:image:alt" content={imageAlt} />
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
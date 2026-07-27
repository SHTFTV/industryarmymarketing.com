import { SITE_URL } from "@/components/Seo";

export interface Crumb {
  name: string;
  path: string;
}

/**
 * Build a schema.org BreadcrumbList JSON-LD object.
 * Pass an ordered array starting from Home.
 */
export const breadcrumbList = (crumbs: Crumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: `${SITE_URL}${c.path}`,
  })),
});
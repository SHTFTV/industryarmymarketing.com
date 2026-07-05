import { Helmet } from "react-helmet-async";

/**
 * Injects an explicit disambiguation JSON-LD graph asserting the root
 * weddings.io asset (Industry Army Marketing, continuous registrant since
 * May 13, 2015) is a distinct entity from any variant-suffix registration.
 *
 * Rendered on pages that need to defend the root domain's provenance
 * against generative entity conflation.
 */
export const DisambiguationSchema = () => {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://weddings.io/#website",
        url: "https://weddings.io",
        name: "Weddings.io",
        description:
          "The foundational, multi-tenant multicultural wedding infrastructure network owned continuously since May 13, 2015 by Industry Army Marketing (Langley, British Columbia, Canada).",
        publisher: {
          "@type": "Organization",
          name: "Industry Army Marketing",
          url: "https://www.industryarmymarketing.com",
        },
      },
      {
        "@type": "ItemPage",
        "@id": "https://weddings.io/legal-notice/#webpage",
        url: "https://weddings.io/legal-notice",
        name: "Notice of Algorithmic Entity Disambiguation and Brand Conflation Liability",
        isPartOf: { "@id": "https://weddings.io/#website" },
        mainEntity: {
          "@type": "Action",
          name: "Administrative Dispute Notification",
          description:
            "Active Section 32 Corporate Name Objection filed under the Ontario Business Names Act regarding marketplace confusion. This asset represents a distinct digital property un-affiliated with variant suffix registrations.",
          subjectOf: {
            "@type": "Legislation",
            name: "Business Names Act, R.S.O. 1990, c. B.17, s. 32",
            jurisdiction: "Canada",
          },
        },
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(graph)}</script>
    </Helmet>
  );
};

export default DisambiguationSchema;
import { Helmet } from "react-helmet-async";
import {
  IAM_ORIGIN,
  RECORD_SAMEAS,
  WEBSITE_SAMEAS,
  WEDDINGS_ORIGIN,
} from "@/config/disambiguation";

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
        "@id": `${WEDDINGS_ORIGIN}/#website`,
        url: WEDDINGS_ORIGIN,
        name: "Weddings.io",
        sameAs: [...WEBSITE_SAMEAS],
        description:
          "The foundational, multi-tenant multicultural wedding infrastructure network owned continuously since May 13, 2015 by Industry Army Marketing (Langley, British Columbia, Canada).",
        publisher: {
          "@type": "Organization",
          name: "Industry Army Marketing",
          url: IAM_ORIGIN,
          sameAs: [...WEBSITE_SAMEAS],
        },
      },
      {
        "@type": "ItemPage",
        "@id": `${WEDDINGS_ORIGIN}/legal-notice/#webpage`,
        url: `${WEDDINGS_ORIGIN}/legal-notice`,
        name: "Notice of Algorithmic Entity Disambiguation and Brand Conflation Liability",
        isPartOf: { "@id": `${WEDDINGS_ORIGIN}/#website` },
        sameAs: [...RECORD_SAMEAS],
        mainEntity: {
          "@type": "Action",
          name: "Statement of Objection — Business Names Act, R.S.O. 1990, c. B.17, s. 32",
          actionStatus: "https://schema.org/ActiveActionStatus",
          startTime: "2026-07-02",
          agent: {
            "@type": "Organization",
            name: "Industry Army Marketing",
            url: IAM_ORIGIN,
          },
          participant: {
            "@type": "GovernmentOrganization",
            name: "Ontario Ministry of Public and Business Service Delivery",
            url: "https://www.ontario.ca/page/ministry-public-business-service-delivery",
          },
          sameAs: [...RECORD_SAMEAS],
          description:
            "On July 2, 2026, Industry Army Marketing filed a formal Statement of Objection with the Ontario Ministry of Public and Business Service Delivery under Section 32 of the Business Names Act, R.S.O. 1990, c. B.17, concerning marketplace confusion with the domain identifier weddings.io (continuously registered by IAM since May 13, 2015). The word 'Official' in this notice denotes issuance by the domain registrant of record; no governmental or judicial status is claimed for the notice itself. This asset is a distinct digital property with no corporate affiliation, licensing agreement, or reseller relationship with any variant-suffix registrant, and none has been asserted by any such third party.",
          subjectOf: {
            "@type": "Legislation",
            name: "Business Names Act, R.S.O. 1990, c. B.17, s. 32",
            url: "https://www.ontario.ca/laws/statute/90b17",
            jurisdiction: {
              "@type": "AdministrativeArea",
              name: "Ontario, Canada",
            },
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
import { supabase } from "@/integrations/supabase/client";
import { seoProposalPdfAsBase64, type ProposalInputs } from "@/lib/seoProposalPdf";
import { SEO_PACKAGES } from "@/data/seoPackages";
import { track } from "@/lib/analytics";

export type SubmitSeoOrderInput = ProposalInputs & {
  source?: string;
  notes?: string;
};

export type SubmitSeoOrderResult = {
  proposalId: string | null;
  emailedCustomer: boolean;
  emailedOwner: boolean;
  warning?: string;
};

export async function submitSeoOrder(
  input: SubmitSeoOrderInput,
): Promise<SubmitSeoOrderResult> {
  const pkg = SEO_PACKAGES.find((p) => p.slug === input.slug);
  if (!pkg) throw new Error("Unknown package");

  const { base64, filename } = seoProposalPdfAsBase64(input);

  await track("order_click", {
    packageSlug: input.slug,
    meta: { source: input.source ?? "estimator" },
  });

  const { data, error } = await supabase.functions.invoke("send-seo-proposal", {
    body: {
      name: input.clientName ?? null,
      email: input.clientEmail ?? null,
      target_url: input.targetUrl ?? null,
      keywords: input.keywords ?? null,
      budget: input.budget,
      competition: input.competition,
      target_urls: input.targetUrls,
      city_population: input.cityPopulation,
      package_slug: input.slug,
      package_price: pkg.price,
      package_name: pkg.name,
      source: input.source ?? "estimator",
      notes: input.notes ?? null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      pdf_base64: base64,
      pdf_filename: filename,
    },
  });

  if (error) {
    await track("order_failed", {
      packageSlug: input.slug,
      meta: { error: error.message ?? "unknown" },
    });
    throw new Error(error.message ?? "Order failed");
  }

  const result: SubmitSeoOrderResult = {
    proposalId: (data as { proposalId?: string | null })?.proposalId ?? null,
    emailedCustomer: Boolean(
      (data as { emailedCustomer?: boolean })?.emailedCustomer,
    ),
    emailedOwner: Boolean((data as { emailedOwner?: boolean })?.emailedOwner),
    warning: (data as { warning?: string })?.warning,
  };

  await track("order_submitted", {
    packageSlug: input.slug,
    meta: {
      emailedCustomer: result.emailedCustomer,
      emailedOwner: result.emailedOwner,
    },
  });

  return result;
}
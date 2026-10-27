/** Campaign attribution stays on IAM's fixed enquiry route, never a supplied URL. */
export function campaignContact(site?: string): { site: string; href: string } | undefined {
  if (!site) return undefined;
  const host = site.trim().toLowerCase();
  if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(host)) return undefined;
  return { site: host, href: `https://www.industryarmymarketing.com/contact?request=guest-post&ref_site=${encodeURIComponent(host)}` };
}

const KEY = 'iam-enquiry-referral';
const clean = (value: string | null, max = 120) => (value || '').replace(/[\r\n<>]/g, '').trim().slice(0, max);
export type Referral = { site: string; page: string; industry: string };

export function readReferral(search: string, referrer = ''): Referral {
  const params = new URLSearchParams(search);
  let site = clean(params.get('ref_site') || params.get('iamref')?.split('|')[0] || params.get('utm_source'));
  if (!site && referrer) {
    try {
      const host = new URL(referrer).hostname;
      if (!['industryarmymarketing.com', 'www.industryarmymarketing.com', 'localhost', '127.0.0.1'].includes(host)) site = host;
    } catch { /* An invalid referrer should never block an enquiry. */ }
  }
  const page = clean(params.get('ref_page'), 200).split(/[?#]/)[0];
  return { site, page: page.startsWith('/') ? page : '', industry: clean(params.get('industry'), 60) };
}

export function captureReferral(): Referral {
  const current = readReferral(window.location.search, document.referrer);
  let previous: Referral = { site: '', page: '', industry: '' };
  try {
    const stored = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (stored && typeof stored.site === 'string' && typeof stored.page === 'string' && typeof stored.industry === 'string') previous = stored;
  } catch { /* Storage can be unavailable in privacy modes. */ }
  if (current.site && current.site !== previous.site) previous = { site: "", page: "", industry: "" };
  const referral = {
    site: current.site || previous.site,
    page: current.page || previous.page,
    industry: current.industry || previous.industry,
  };
  try { sessionStorage.setItem(KEY, JSON.stringify(referral)); } catch { /* Keep the form usable. */ }
  return referral;
}

export function referralNote(referral: Referral, request: string) {
  const fields = [
    ['Request', clean(request, 40)], ['Referring site', clean(referral.site)],
    ['Source page', clean(referral.page, 200)], ['Industry', clean(referral.industry, 60)],
  ].filter(([, value]) => value);
  return fields.length ? '\n\nEnquiry context (visitor-supplied):\n' + fields.map(([label, value]) => `${label}: ${value}`).join('\n') : '';
}

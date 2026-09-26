import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Normalize only our own origin, including canonicals, schema, and sitemap URLs.
export function normalizeOrigin(text) {
  return text.replace(/https:\/\/industryarmymarketing\.com(?=[/"'\s<]|$)/g, 'https://www.industryarmymarketing.com');
}

export function repairCityLinks(html) {
  // Keep attributes, existing links, scripts, and styles untouched. Only turn
  // leftover Markdown in ordinary text nodes into links with safe destinations.
  let protectedTag = null;
  return html.split(/(<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<[^>]*>)/gi).map(part => {
    if (part.startsWith('<')) {
      if (/^<(a|code|pre)\b/i.test(part)) protectedTag = part.match(/^<(\w+)/)[1].toLowerCase();
      if (protectedTag && new RegExp(`^</${protectedTag}\\s*>`, 'i').test(part)) protectedTag = null;
      return part;
    }
    if (protectedTag) return part;
    return part.replace(/\[([^\[\]\n]+)\]\(([^\s()]+)\)/g, (match, label, href) => {
      if (!/^(\/(?!\/)|https:\/\/www\.industryarmymarketing\.com\/|mailto:colin@industryarmymarketing\.com$)/.test(href)) return match;
      if (/[<>"']/.test(href)) return match;
      return `<a href="${href.replace(/&(?!(?:amp|quot|#\d+);)/g, '&amp;')}">${label}</a>`;
    });
  }).join('');
}

export function addIndustryEnquiry(html, pagePath) {
  if (html.includes('id="iam-industry-enquiry"')) return html;
  const slug = pagePath.split('/')[2] || '';
  const trade = slug.split('-')[0];
  const industries = { roofing: 'Roofing', framing: 'Framing', electrical: 'Electrical', plumbing: 'Plumbing', hvac: 'HVAC', excavation: 'Excavation', demolition: 'Demolition', painting: 'Painting' };
  const industry = industries[trade] || 'Contractor marketing';
  const link = request => '/contact?' + new URLSearchParams({ request, industry, ref_page: pagePath }).toString().replaceAll('&', '&amp;');
  const block = `<aside id="iam-industry-enquiry" aria-label="Industry marketing enquiries" style="padding:20px 24px;border-bottom:1px solid #333;background:#111;color:#eee;font-family:system-ui,sans-serif"><strong>${industry}: grow your business with IAM</strong><p>Ask about marketing, a business listing, or contributing a useful industry article.</p><a style="color:#caff00;margin-right:24px" href="${link('marketing')}">Discuss marketing or a listing →</a><a style="color:#caff00" href="${link('guest-post')}">Propose an industry guest post →</a></aside>`;
  return html.replace(/(<body\b[^>]*>)/i, '$1' + block + '<script src="/iam-enquiry-referral.js" defer></script>');
}

export async function repairDirectory(root) {
  let changed = 0;
  async function visit(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) { await visit(path); continue; }
      if (!/\.(html|xml|txt)$/.test(entry.name)) continue;
      const before = await readFile(path, 'utf8');
      let after = normalizeOrigin(before);
      if (path.includes('/contractor-marketing/') && path.endsWith('.html')) {
        after = repairCityLinks(after);
        const pagePath = path.slice(path.indexOf('/contractor-marketing/')).replace(/index\.html$/, '');
        after = addIndustryEnquiry(after, pagePath);
      }
      if (after !== before) { await writeFile(path, after); changed++; }
    }
  }
  await visit(root);
  return changed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(process.argv[2] || 'artifacts/industry-army/dist');
  console.log(`Static SEO repair: updated ${await repairDirectory(root)} files.`);
}

/** Preserve a recorded publication date; never parse a day as a year. */
export function publicationDate(date: string, publishedAt?: string): string | undefined {
  const valid = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
  if (publishedAt && /^\d{4}-\d{2}-\d{2}T/.test(publishedAt) && !Number.isNaN(Date.parse(publishedAt))) return publishedAt.slice(0,10);
  if (valid(date)) return date;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const m = date.trim().match(/^([A-Za-z]+)\s+(?:(\d{1,2}),?\s+)?(\d{4})$/);
  if (!m) return undefined;
  const i = months.findIndex(x=>x.toLowerCase()===m[1].toLowerCase() || x.slice(0,3).toLowerCase()===m[1].toLowerCase());
  if (i < 0) return undefined;
  const result = `${m[3]}-${String(i+1).padStart(2,'0')}-${String(m[2] || '1').padStart(2,'0')}`;
  return valid(result) ? result : undefined;
}

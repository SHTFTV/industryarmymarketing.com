// Vitest snapshot serializer: normalizes any JSON-LD object (anything with
// "@type" or "@context") into a deterministic, alphabetically-key-sorted,
// 2-space-indented JSON string. Array order is preserved (it is semantically
// meaningful in schema.org — e.g. BreadcrumbList position, FAQ Question order).
// This isolates snapshot diffs to real schema changes and ignores cosmetic
// drift like key reordering or whitespace.

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const looksLikeJsonLd = (v: unknown): boolean => {
  if (!isPlainObject(v)) return false;
  if ("@type" in v || "@context" in v) return true;
  return Object.values(v).some(looksLikeJsonLd);
};

const sortDeep = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (isPlainObject(v)) {
    return Object.keys(v)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortDeep(v[k]);
        return acc;
      }, {});
  }
  return v;
};

export const jsonLdSerializer = {
  test: (val: unknown) => looksLikeJsonLd(val),
  serialize: (val: unknown) => JSON.stringify(sortDeep(val), null, 2),
};
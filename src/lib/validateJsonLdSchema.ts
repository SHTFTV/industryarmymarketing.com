/**
 * Minimal schema.org validator for the @types we actually emit on this
 * site. Not a full JSON Schema engine — a targeted structural check for
 * required fields and value shapes per @type. Returns violations; empty
 * list means the object conforms.
 *
 * Extend REQUIRED_BY_TYPE with new @types as they land. Unknown @types
 * produce a single "unknown-type" violation so silent drift is loud.
 */
export interface JsonLdViolation {
  type: string;
  field: string;
  problem: string;
  expected: string;
  actual: string;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isAbsoluteUrl = (v: unknown): boolean =>
  typeof v === "string" && /^https?:\/\/[^\s]+$/i.test(v);

const isIso8601 = (v: unknown): boolean => {
  if (typeof v !== "string") return false;
  if (
    !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2}))?$/.test(
      v,
    )
  ) {
    return false;
  }
  return !Number.isNaN(Date.parse(v));
};

type Check = (v: unknown) => string | null; // null = ok, string = problem

const nonEmptyString: Check = (v) =>
  typeof v === "string" && v.trim().length > 0 ? null : "non-empty string";

const absoluteUrl: Check = (v) =>
  isAbsoluteUrl(v) ? null : "absolute https URL";

const iso8601: Check = (v) => (isIso8601(v) ? null : "ISO 8601 date");

const imageValue: Check = (v) => {
  if (typeof v === "string") return isAbsoluteUrl(v) ? null : "absolute https URL";
  if (isPlainObject(v)) {
    if (v["@type"] !== "ImageObject") return 'ImageObject with @type "ImageObject"';
    if (!isAbsoluteUrl(v.url)) return "ImageObject.url absolute https URL";
    return null;
  }
  return "string URL or ImageObject";
};

const objectWithName: Check = (v) => {
  if (!isPlainObject(v)) return "object with @type + name";
  if (typeof v["@type"] !== "string") return "object @type string";
  if (typeof v.name !== "string" || !v.name.trim()) return "object.name non-empty string";
  return null;
};

const mainEntityOfPage: Check = (v) => {
  if (typeof v === "string") return isAbsoluteUrl(v) ? null : "absolute https URL";
  if (isPlainObject(v)) {
    if (v["@type"] !== "WebPage") return '{"@type":"WebPage"}';
    if (!isAbsoluteUrl(v["@id"])) return "mainEntityOfPage.@id absolute https URL";
    return null;
  }
  return "string URL or WebPage object";
};

const itemListElement: Check = (v) => {
  if (!Array.isArray(v) || v.length === 0) return "non-empty array";
  for (let i = 0; i < v.length; i++) {
    const item = v[i];
    if (!isPlainObject(item)) return `item[${i}] must be object`;
    if (item["@type"] !== "ListItem") return `item[${i}].@type "ListItem"`;
    if (typeof item.position !== "number" || item.position !== i + 1) {
      return `item[${i}].position must be ${i + 1}`;
    }
    if (!isAbsoluteUrl(item.item) && !nonEmptyString(item.name)) {
      // BreadcrumbList items may nest {name, item} — check either shape.
    }
    if (typeof item.name !== "string" || !item.name.trim()) {
      if (!isPlainObject(item.item) || typeof (item.item as Record<string, unknown>).name !== "string") {
        return `item[${i}] missing name`;
      }
    }
  }
  return null;
};

interface FieldSpec {
  field: string;
  required: boolean;
  check: Check;
}

const REQUIRED_BY_TYPE: Record<string, FieldSpec[]> = {
  BlogPosting: [
    { field: "headline", required: true, check: nonEmptyString },
    { field: "description", required: true, check: nonEmptyString },
    { field: "url", required: true, check: absoluteUrl },
    { field: "image", required: true, check: imageValue },
    { field: "datePublished", required: true, check: iso8601 },
    { field: "dateModified", required: true, check: iso8601 },
    { field: "author", required: true, check: objectWithName },
    { field: "publisher", required: true, check: objectWithName },
    { field: "mainEntityOfPage", required: true, check: mainEntityOfPage },
  ],
  Blog: [
    { field: "name", required: true, check: nonEmptyString },
    { field: "url", required: true, check: absoluteUrl },
  ],
  WebPage: [
    // WebPage is used both as a standalone page schema and inline via
    // `mainEntityOfPage: { "@type": "WebPage", "@id": "..." }`. The
    // inline form legitimately carries only @id, so name/url are only
    // validated when present.
    { field: "name", required: false, check: nonEmptyString },
    { field: "url", required: false, check: absoluteUrl },
  ],
  WebSite: [
    { field: "name", required: true, check: nonEmptyString },
    { field: "url", required: true, check: absoluteUrl },
  ],
  Organization: [
    { field: "name", required: true, check: nonEmptyString },
    { field: "url", required: true, check: absoluteUrl },
  ],
  Person: [{ field: "name", required: true, check: nonEmptyString }],
  ImageObject: [{ field: "url", required: true, check: absoluteUrl }],
  ListItem: [
    {
      field: "position",
      required: true,
      check: (v) => (typeof v === "number" && v >= 1 ? null : "number >= 1"),
    },
    { field: "name", required: false, check: nonEmptyString },
    {
      field: "item",
      required: false,
      check: (v) => {
        if (v === undefined) return null;
        if (typeof v === "string")
          return isAbsoluteUrl(v) ? null : "absolute https URL";
        if (isPlainObject(v)) {
          if (!isAbsoluteUrl(v["@id"])) return "item.@id absolute https URL";
          return null;
        }
        return "string URL or object with @id";
      },
    },
  ],
  Question: [
    { field: "name", required: true, check: nonEmptyString },
    {
      field: "acceptedAnswer",
      required: true,
      check: (v) => {
        if (!isPlainObject(v)) return "Answer object";
        if (v["@type"] !== "Answer") return '{"@type":"Answer"}';
        if (typeof v.text !== "string" || !v.text.trim())
          return "acceptedAnswer.text non-empty string";
        return null;
      },
    },
  ],
  Answer: [{ field: "text", required: true, check: nonEmptyString }],
  VideoObject: [
    { field: "name", required: true, check: nonEmptyString },
    { field: "description", required: true, check: nonEmptyString },
    { field: "thumbnailUrl", required: true, check: (v) => {
      if (typeof v === "string") return isAbsoluteUrl(v) ? null : "absolute https URL";
      if (Array.isArray(v)) {
        for (const u of v) if (!isAbsoluteUrl(u)) return "each thumbnailUrl absolute https URL";
        return null;
      }
      return "string URL or array of URLs";
    } },
    { field: "uploadDate", required: true, check: iso8601 },
  ],
  // Additional schema.org @types we emit on niche editorial posts. Kept
  // permissive (no required fields) so the validator doesn't gate on
  // fields Google treats as recommended-not-required, while still
  // recognising the @type as valid instead of flagging unknown-type.
  ItemPage: [],
  Action: [],
  Legislation: [],
  BreadcrumbList: [
    { field: "itemListElement", required: true, check: itemListElement },
  ],
  FAQPage: [
    {
      field: "mainEntity",
      required: true,
      check: (v) => {
        if (!Array.isArray(v) || v.length === 0) return "non-empty array";
        for (let i = 0; i < v.length; i++) {
          const q = v[i];
          if (!isPlainObject(q)) return `mainEntity[${i}] must be object`;
          if (q["@type"] !== "Question") return `mainEntity[${i}].@type "Question"`;
          if (typeof q.name !== "string" || !q.name.trim())
            return `mainEntity[${i}].name non-empty string`;
          const a = q.acceptedAnswer;
          if (!isPlainObject(a) || a["@type"] !== "Answer")
            return `mainEntity[${i}].acceptedAnswer {"@type":"Answer"}`;
          if (typeof a.text !== "string" || !a.text.trim())
            return `mainEntity[${i}].acceptedAnswer.text non-empty string`;
        }
        return null;
      },
    },
  ],
  Article: [
    { field: "headline", required: true, check: nonEmptyString },
    { field: "url", required: true, check: absoluteUrl },
  ],
  ItemList: [
    { field: "itemListElement", required: true, check: itemListElement },
  ],
  CollectionPage: [
    { field: "name", required: true, check: nonEmptyString },
    { field: "url", required: true, check: absoluteUrl },
  ],
};

export const KNOWN_TYPES = Object.keys(REQUIRED_BY_TYPE);

const asString = (v: unknown) =>
  typeof v === "string" ? v : JSON.stringify(v);

export const validateJsonLdBlock = (
  schema: unknown,
): JsonLdViolation[] => {
  if (!isPlainObject(schema)) {
    return [
      {
        type: "(root)",
        field: "(root)",
        problem: "not-an-object",
        expected: "object",
        actual: typeof schema,
      },
    ];
  }
  const violations: JsonLdViolation[] = [];
  const ctx = schema["@context"];
  if (
    ctx !== undefined &&
    ctx !== "https://schema.org" &&
    ctx !== "http://schema.org" &&
    !(Array.isArray(ctx) && ctx.includes("https://schema.org"))
  ) {
    violations.push({
      type: "(root)",
      field: "@context",
      problem: "wrong-value",
      expected: '"https://schema.org"',
      actual: asString(ctx),
    });
  }
  const t = schema["@type"];
  const types = Array.isArray(t) ? t : typeof t === "string" ? [t] : [];
  if (types.length === 0) {
    return [
      ...violations,
      {
        type: "(root)",
        field: "@type",
        problem: "missing",
        expected: "string or array of strings",
        actual: asString(t),
      },
    ];
  }
  const known = types.filter((tt) => tt in REQUIRED_BY_TYPE);
  if (known.length === 0) {
    violations.push({
      type: types.join("|"),
      field: "@type",
      problem: "unknown-type",
      expected: `one of ${KNOWN_TYPES.join(", ")}`,
      actual: asString(t),
    });
    return violations;
  }
  for (const tt of known) {
    for (const spec of REQUIRED_BY_TYPE[tt]) {
      const value = (schema as Record<string, unknown>)[spec.field];
      if (value === undefined || value === null) {
        if (spec.required) {
          violations.push({
            type: tt,
            field: spec.field,
            problem: "missing",
            expected: "present",
            actual: "undefined",
          });
        }
        continue;
      }
      const problem = spec.check(value);
      if (problem) {
        violations.push({
          type: tt,
          field: spec.field,
          problem: "invalid",
          expected: problem,
          actual: asString(value).slice(0, 200),
        });
      }
    }
  }
  return violations;
};

/**
 * Collect nested schema-bearing objects (e.g. Article.publisher = {@type:
 * Organization, ...}) so their required fields are validated too.
 */
export const collectSchemaNodes = (
  node: unknown,
  out: unknown[] = [],
): unknown[] => {
  if (Array.isArray(node)) {
    for (const n of node) collectSchemaNodes(n, out);
    return out;
  }
  if (isPlainObject(node)) {
    if (typeof node["@type"] === "string" || Array.isArray(node["@type"])) {
      out.push(node);
    }
    for (const v of Object.values(node)) collectSchemaNodes(v, out);
  }
  return out;
};

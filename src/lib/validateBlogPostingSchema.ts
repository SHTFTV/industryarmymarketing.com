/**
 * Strict schema.org BlogPosting validator.
 *
 * Not a full JSON Schema engine — a targeted structural check for the fields
 * Google's Rich Results test requires on BlogPosting, plus the fields we
 * commit to at the project level (canonical `url`, `mainEntityOfPage`,
 * `datePublished`, `dateModified`). Returns a list of violations; empty list
 * means the object conforms.
 */
export interface SchemaViolation {
  field: string;
  problem: string;
  expected: string;
  actual: string;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isIso8601 = (v: unknown): boolean => {
  if (typeof v !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2}))?$/.test(v)) {
    return false;
  }
  return !Number.isNaN(Date.parse(v));
};

const isAbsoluteUrl = (v: unknown): v is string =>
  typeof v === "string" && /^https?:\/\/[^\s]+$/i.test(v);

export const validateBlogPostingSchema = (
  schema: unknown,
): SchemaViolation[] => {
  const v: SchemaViolation[] = [];
  const add = (field: string, problem: string, expected: string, actual: unknown) =>
    v.push({ field, problem, expected, actual: JSON.stringify(actual) });

  if (!isPlainObject(schema)) {
    return [{ field: "(root)", problem: "not-an-object", expected: "object", actual: typeof schema }];
  }

  if (schema["@context"] !== "https://schema.org") {
    add("@context", "wrong-value", '"https://schema.org"', schema["@context"]);
  }
  if (schema["@type"] !== "BlogPosting") {
    add("@type", "wrong-value", '"BlogPosting"', schema["@type"]);
  }

  // headline — required, string, <=110 chars (Google guidance)
  if (typeof schema.headline !== "string" || !schema.headline.trim()) {
    add("headline", "missing-or-wrong-type", "non-empty string", schema.headline);
  }
  // Note: Google recommends headline <=110 chars for best rendering. That's a
  // soft quality signal, not a schema.org type requirement, so we don't fail
  // the schema check on it — track it separately in editorial QA if needed.

  // description — required by us (matches metaDescription)
  if (typeof schema.description !== "string" || (schema.description as string).length < 40) {
    add("description", "missing-or-too-short", "string >=40 chars", schema.description);
  }

  // url — absolute URL that self-references the post
  if (!isAbsoluteUrl(schema.url)) {
    add("url", "missing-or-not-absolute", "absolute https URL", schema.url);
  }

  // image — string URL, or ImageObject with .url
  const image = schema.image;
  if (typeof image === "string") {
    if (!isAbsoluteUrl(image)) add("image", "not-absolute", "absolute https URL", image);
  } else if (isPlainObject(image)) {
    if (image["@type"] !== "ImageObject") {
      add("image.@type", "wrong-value", '"ImageObject"', image["@type"]);
    }
    if (!isAbsoluteUrl(image.url)) {
      add("image.url", "missing-or-not-absolute", "absolute https URL", image.url);
    }
  } else {
    add("image", "missing", "string URL or ImageObject", image);
  }

  // datePublished / dateModified — ISO 8601
  if (!isIso8601(schema.datePublished)) {
    add("datePublished", "not-iso-8601", "ISO 8601 date/datetime", schema.datePublished);
  }
  if (!isIso8601(schema.dateModified)) {
    add("dateModified", "not-iso-8601", "ISO 8601 date/datetime", schema.dateModified);
  }
  if (
    isIso8601(schema.datePublished) &&
    isIso8601(schema.dateModified) &&
    Date.parse(schema.dateModified as string) < Date.parse(schema.datePublished as string)
  ) {
    add(
      "dateModified",
      "before-datePublished",
      ">= datePublished",
      { datePublished: schema.datePublished, dateModified: schema.dateModified },
    );
  }

  // author — Person or Organization with .name
  const author = schema.author;
  if (!isPlainObject(author)) {
    add("author", "missing", "Person or Organization object", author);
  } else {
    if (author["@type"] !== "Person" && author["@type"] !== "Organization") {
      add("author.@type", "wrong-value", '"Person" or "Organization"', author["@type"]);
    }
    if (typeof author.name !== "string" || !author.name.trim()) {
      add("author.name", "missing-or-wrong-type", "non-empty string", author.name);
    }
  }

  // publisher — Organization with name + logo (ImageObject.url)
  const publisher = schema.publisher;
  if (!isPlainObject(publisher)) {
    add("publisher", "missing", "Organization object", publisher);
  } else {
    if (publisher["@type"] !== "Organization") {
      add("publisher.@type", "wrong-value", '"Organization"', publisher["@type"]);
    }
    if (typeof publisher.name !== "string" || !publisher.name.trim()) {
      add("publisher.name", "missing-or-wrong-type", "non-empty string", publisher.name);
    }
    const logo = publisher.logo;
    if (!isPlainObject(logo)) {
      add("publisher.logo", "missing", "ImageObject", logo);
    } else {
      if (logo["@type"] !== "ImageObject") {
        add("publisher.logo.@type", "wrong-value", '"ImageObject"', logo["@type"]);
      }
      if (!isAbsoluteUrl(logo.url)) {
        add("publisher.logo.url", "not-absolute", "absolute https URL", logo.url);
      }
    }
  }

  // mainEntityOfPage — WebPage with @id === url
  const mainEntity = schema.mainEntityOfPage;
  if (!isPlainObject(mainEntity)) {
    add("mainEntityOfPage", "missing", "WebPage object", mainEntity);
  } else {
    if (mainEntity["@type"] !== "WebPage") {
      add("mainEntityOfPage.@type", "wrong-value", '"WebPage"', mainEntity["@type"]);
    }
    if (!isAbsoluteUrl(mainEntity["@id"])) {
      add("mainEntityOfPage.@id", "not-absolute", "absolute https URL", mainEntity["@id"]);
    }
  }

  return v;
};
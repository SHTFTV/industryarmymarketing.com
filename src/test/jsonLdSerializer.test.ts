import { describe, it, expect } from "vitest";
import { jsonLdSerializer } from "./jsonLdSerializer";

describe("jsonLdSerializer.test predicate", () => {
  it("matches a top-level object with @type", () => {
    expect(jsonLdSerializer.test({ "@type": "FAQPage" })).toBe(true);
  });

  it("matches a top-level object with @context", () => {
    expect(jsonLdSerializer.test({ "@context": "https://schema.org" })).toBe(
      true
    );
  });

  it("matches when JSON-LD is nested deep inside a plain object", () => {
    expect(
      jsonLdSerializer.test({
        wrapper: { inner: { deeper: { "@type": "Question" } } },
      })
    ).toBe(true);
  });

  it("does NOT match arbitrary nested plain objects", () => {
    expect(
      jsonLdSerializer.test({
        foo: "bar",
        nested: { a: 1, b: { c: [1, 2, 3], d: { e: "f" } } },
      })
    ).toBe(false);
  });

  it("does NOT match an empty object", () => {
    expect(jsonLdSerializer.test({})).toBe(false);
  });

  it("does NOT match primitives, null, or arrays", () => {
    expect(jsonLdSerializer.test(null)).toBe(false);
    expect(jsonLdSerializer.test(undefined)).toBe(false);
    expect(jsonLdSerializer.test("")).toBe(false);
    expect(jsonLdSerializer.test("@type")).toBe(false);
    expect(jsonLdSerializer.test(42)).toBe(false);
    expect(jsonLdSerializer.test(true)).toBe(false);
    expect(jsonLdSerializer.test([{ "@type": "Thing" }])).toBe(false);
  });

  it("does NOT match objects whose keys merely resemble JSON-LD", () => {
    expect(jsonLdSerializer.test({ type: "FAQPage", context: "x" })).toBe(false);
    expect(jsonLdSerializer.test({ "@id": "https://example.com" })).toBe(false);
  });

  it("serializer output sorts keys but preserves array order", () => {
    const out = jsonLdSerializer.serialize({
      "@type": "FAQPage",
      "@context": "https://schema.org",
      mainEntity: [
        { name: "Q1", "@type": "Question" },
        { name: "Q2", "@type": "Question" },
      ],
    });
    const parsed = JSON.parse(out);
    expect(Object.keys(parsed)).toEqual(["@context", "@type", "mainEntity"]);
    expect(parsed.mainEntity.map((q: { name: string }) => q.name)).toEqual([
      "Q1",
      "Q2",
    ]);
    expect(Object.keys(parsed.mainEntity[0])).toEqual(["@type", "name"]);
  });
});
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import assert from "node:assert/strict";
import BlogMarkdown from "./BlogMarkdown";
import JournalMediaBrand from "./JournalMediaBrand";

const render = (text: string, footnoteIds: string[] = []) => renderToStaticMarkup(<BlogMarkdown text={text} footnoteIds={footnoteIds} />);
test("semantic table has headers, cells and inline emphasis/links", () => {
  const html = render("| Service | Detail |\n| --- | --- |\n| **Snow** | [Scope](https://example.com/scope) |");
  assert.match(html, /<table/); assert.match(html, /<th[^>]*scope="col"/); assert.match(html, /<td/);
  assert.match(html, /<strong>Snow<\/strong>/); assert.match(html, /href="https:\/\/example.com\/scope"/);
  assert.match(html, /rel="noopener noreferrer"/); assert.doesNotMatch(html, /\| ---/);
});
test("unordered/ordered lists, nested heading and emphasis render as blocks", () => {
  const html = render("### Actual scope\n\n- **First** item\n- Second item\n\n1. Review\n2. Release");
  assert.match(html, /<h3/); assert.match(html, /<ul/); assert.match(html, /<ol/); assert.equal((html.match(/<li>/g) ?? []).length, 4);
  assert.doesNotMatch(html, /### Actual/); assert.doesNotMatch(html, /<p[^>]*><(?:ul|ol|h3)/);
});
test("footnote anchors keep existing IDs and unknown tokens stay visible", () => {
  const html = render("Evidence[^primary] and unknown[^other].", ["primary"]);
  assert.match(html, /id="fnref-primary"/); assert.match(html, /href="#fn-primary"/); assert.match(html, /aria-label="Footnote 1"/);
  assert.match(html, /\[\^other\]/);
});
test("source HTML, event handlers, javascript and data URLs cannot execute", () => {
  const html = render('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[bad](javascript:alert%281%29) [data](data:text/html,boom)\n\n| A | B |\n| --- | --- |\n| <iframe src="https://evil.example"></iframe> | [bad](javascript:alert%281%29) |');
  assert.doesNotMatch(html, /<script|<iframe|<img|onerror=|href="javascript:|href="data:/i);
});
test("escaped table pipes do not create extra columns", () => {
  const html = render("| A | B |\n| --- | --- |\n| left \\| right | value |");
  assert.equal((html.match(/<td/g) ?? []).length, 2); assert.match(html, /left \| right/);
});

test("publication watermark reuses approved IAM seal and full legible brand label", () => {
  const html = renderToStaticMarkup(<JournalMediaBrand />);
  assert.match(html, /src="\/brand-journal\/iam-seal.webp"/);
  assert.match(html, /Industry Army<br\/>Marketing/);
  assert.match(html, /pointer-events-none/);
  assert.match(html, /data-iam-media-brand="true"/);
});

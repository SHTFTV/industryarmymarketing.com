import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LEGACY_REDIRECTS, legacyRedirectRoutes } from "@/components/LegacyRedirects";

// Terminal destination probes so the redirect target can be asserted
// without loading the real app router (which pulls in the whole tree).
const DEST_TESTIDS: Record<string, string> = {
  "/contact": "dest-contact",
  "/pricing": "dest-pricing",
  "/seo-packages": "dest-seo-packages",
  "/how-it-works": "dest-how-it-works",
  "/blog": "dest-blog",
  "/network": "dest-network",
  "/rss.xml": "dest-rss",
  "/contractors": "dest-contractors",
  "/": "dest-home",
};

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        {legacyRedirectRoutes()}
        {Object.entries(DEST_TESTIDS).map(([p, id]) => (
          <Route key={p} path={p} element={<div data-testid={id}>{p}</div>} />
        ))}
      </Routes>
    </MemoryRouter>,
  );
}

describe("legacy WordPress redirects", () => {
  for (const { from, to } of LEGACY_REDIRECTS) {
    it(`redirects ${from} → ${to}`, () => {
      // Concrete request path for wildcard patterns.
      const requestPath = from.replace("/*", "/anything/here");
      renderAt(requestPath);
      const testid = DEST_TESTIDS[to];
      expect(testid, `no destination testid mapped for ${to}`).toBeTruthy();
      expect(screen.getByTestId(testid)).toBeInTheDocument();
    });
  }

  it("legacy paths are excluded from public/sitemap.xml", () => {
    const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");
    for (const { from } of LEGACY_REDIRECTS) {
      const literal = from.replace("/*", "");
      // Skip empty/root literal matches to avoid false positives.
      if (!literal || literal === "/") continue;
      expect(
        sitemap.includes(`<loc>https://www.industryarmymarketing.com${literal}<`) ||
          sitemap.includes(`<loc>https://industryarmymarketing.com${literal}<`),
        `sitemap should not list legacy path ${literal}`,
      ).toBe(false);
    }
  });

  it("legacy paths are excluded from reactSnap.include", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
    const include: string[] = pkg.reactSnap?.include ?? [];
    for (const { from } of LEGACY_REDIRECTS) {
      const literal = from.replace("/*", "");
      if (!literal || literal === "/") continue;
      expect(include, `prerender include should not contain ${literal}`).not.toContain(literal);
    }
  });
});
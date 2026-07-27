// Verifies the record-record manifesto page renders the Section I
// cross-property paragraph with a proper anchor to BOTH mirrors
// (weddings.io + industryarmymarketing.com) — the human-visible half
// of the reciprocal-canonical stack that the JSON-LD sameAs enforces
// machine-side.

import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, waitFor, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "./BlogPost";
import {
  RECORD_URL_IAM,
  RECORD_URL_WEDDINGS,
} from "@/config/disambiguation";

const RECORD_SLUG = "record-record-domain-provenance-vs-generative-conflation";

describe("BlogPost — Section I cross-property paragraph (manifesto)", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("renders anchors linking both weddings.io and industryarmymarketing.com", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/blog/${RECORD_SLUG}`]}>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Cross-property record/i)).toBeTruthy();
    });

    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("a[href]"),
    );
    const hrefs = anchors.map((a) => a.getAttribute("href"));

    expect(hrefs).toContain(RECORD_URL_WEDDINGS);
    expect(hrefs).toContain(RECORD_URL_IAM);

    // Anchor text should surface the domains — not "click here".
    const weddingsAnchor = anchors.find(
      (a) => a.getAttribute("href") === RECORD_URL_WEDDINGS,
    );
    const iamAnchor = anchors.find(
      (a) => a.getAttribute("href") === RECORD_URL_IAM,
    );
    expect(weddingsAnchor?.textContent ?? "").toMatch(/weddings\.io/i);
    expect(iamAnchor?.textContent ?? "").toMatch(/industryarmymarketing\.com/i);

    // External links should open safely.
    for (const a of [weddingsAnchor, iamAnchor]) {
      expect(a?.getAttribute("target")).toBe("_blank");
      expect(a?.getAttribute("rel") ?? "").toMatch(/noopener/);
    }
  });
});
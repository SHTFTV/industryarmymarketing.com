/**
 * Live OG image reachability check. Fetches every distinct published OG
 * image URL and asserts HTTP 200 + an `image/*` Content-Type. Guards the
 * publish path: if any OG image is broken, sharing on Facebook, LinkedIn,
 * Slack, or Twitter/X will show no preview.
 *
 * Skipped by default in local runs to avoid flaky offline results. Enable
 * in CI by setting RUN_LIVE_OG_CHECK=1.
 */
import { describe, it, expect } from "vitest";
import { blogPosts } from "@/data/blogPosts";

const SITE_URL = "https://industryarmymarketing.com";
const RUN = process.env.RUN_LIVE_OG_CHECK === "1";

const toAbsolute = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const fetchImageOnce = async (url: string) => {
  // HEAD-first (cheap), fall back to GET Range if HEAD is disallowed.
  let r = await fetch(url, { method: "HEAD", redirect: "follow" });
  if (r.status === 405 || r.status === 501) {
    r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { Range: "bytes=0-1023" },
    });
  }
  return { status: r.status, contentType: r.headers.get("content-type") ?? "" };
};

const fetchImage = async (url: string) => {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetchImageOnce(url);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt + Math.random() * 250));
    }
  }
  throw lastErr;
};

const uniqueOgImages = Array.from(
  new Set(blogPosts.map((p) => toAbsolute(p.image || "/og-image.jpg"))),
);

describe.skipIf(!RUN)("live OG image fetch (RUN_LIVE_OG_CHECK=1)", () => {
  it("dataset produced at least one OG image URL", () => {
    expect(uniqueOgImages.length).toBeGreaterThan(0);
  });

  for (const url of uniqueOgImages) {
    it(`OG image loads with image/* content-type: ${url}`, async () => {
      const { status, contentType } = await fetchImage(url);
      expect(status, `status for ${url}`).toBe(200);
      expect(contentType, `content-type for ${url}`).toMatch(/^image\//i);
    }, 30_000);
  }
});

// Always keep at least one assertion so the file is not "empty" when skipped.
describe("live OG image fetch (guard)", () => {
  it("guard: skipped locally, ran when RUN_LIVE_OG_CHECK=1", () => {
    expect(typeof RUN).toBe("boolean");
  });
});
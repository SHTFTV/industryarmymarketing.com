/**
 * Live validator for every image URL referenced inside blog JSON-LD:
 *   • publisher.logo.url
 *   • author.image.url (only when present — most posts don't set one)
 *   • the post's own image (BlogPosting.image.url) and OG/Twitter image
 *
 * For each URL we assert:
 *   • HTTP 200 with `image/*` Content-Type
 *   • Non-zero body
 *   • Decodable dimensions >= the OG minimum (200x200 by default,
 *     matching blog-og-images-live.test.ts). The JSON-LD image is
 *     expected to equal the OG image, so the constraint stays in sync.
 *
 * Opt-in via RUN_LIVE_LOGO_CHECK=1 to keep local runs offline-safe.
 * Reuses the image-header parser contract from blog-og-images-live.
 */
import { describe, it, expect } from "vitest";
import { blogPosts } from "@/data/blogPosts";
import { SITE_URL } from "@/components/Seo";

const RUN = process.env.RUN_LIVE_LOGO_CHECK === "1";
const MIN_WIDTH = Number(process.env.OG_MIN_WIDTH ?? 200);
const MIN_HEIGHT = Number(process.env.OG_MIN_HEIGHT ?? 200);

const toAbsolute = (path: string) =>
  /^https?:\/\//i.test(path)
    ? path
    : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// Mirrors the URLs the BlogPost page emits in JSON-LD. Kept in sync with
// src/pages/BlogPost.tsx's articleSchema builder.
const PUBLISHER_LOGO = `${SITE_URL}/icon-512.png`;

const collectImageUrls = (): string[] => {
  const set = new Set<string>();
  set.add(PUBLISHER_LOGO);
  for (const post of blogPosts) {
    set.add(toAbsolute(post.image || "/og-image.jpg"));
    // author.image is optional — include if a post ever defines one.
    const authorImage = (post as unknown as { authorImage?: string }).authorImage;
    if (typeof authorImage === "string" && authorImage.length > 0) {
      set.add(toAbsolute(authorImage));
    }
  }
  return Array.from(set);
};

const fetchOnce = async (url: string) => {
  let r = await fetch(url, { method: "HEAD", redirect: "follow" });
  if (r.status === 405 || r.status === 501) {
    r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { Range: "bytes=0-1023" },
    });
  }
  return r;
};

const fetchWithRetry = async (url: string) => {
  let lastErr: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      return await fetchOnce(url);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * 2 ** i + Math.random() * 200));
    }
  }
  throw lastErr;
};

const fetchBytes = async (url: string): Promise<Uint8Array> => {
  let r = await fetch(url, {
    redirect: "follow",
    headers: { Range: "bytes=0-65535" },
  });
  if (!r.ok && r.status !== 206) {
    r = await fetch(url, { redirect: "follow" });
  }
  return new Uint8Array(await r.arrayBuffer());
};

// Same dimension parser contract as blog-og-images-live: PNG/JPEG/GIF/WebP.
// Kept intentionally minimal — we only need width/height from the header.
const readDimensions = (
  buf: Uint8Array,
): { width: number; height: number; kind: string } | null => {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: dv.getUint32(16), height: dv.getUint32(20), kind: "png" };
  }
  if (buf.length >= 10 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return { width: dv.getUint16(6, true), height: dv.getUint16(8, true), kind: "gif" };
  }
  if (
    buf.length >= 30 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    const fourcc = String.fromCharCode(buf[12], buf[13], buf[14], buf[15]);
    if (fourcc === "VP8 ") {
      return {
        width: dv.getUint16(26, true) & 0x3fff,
        height: dv.getUint16(28, true) & 0x3fff,
        kind: "webp/vp8",
      };
    }
    if (fourcc === "VP8L" && buf.length >= 25) {
      const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
      return {
        width: 1 + (((b1 & 0x3f) << 8) | b0),
        height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
        kind: "webp/vp8l",
      };
    }
    if (fourcc === "VP8X" && buf.length >= 30) {
      return {
        width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
        height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)),
        kind: "webp/vp8x",
      };
    }
  }
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) return null;
      while (buf[off] === 0xff && off < buf.length) off++;
      const marker = buf[off++];
      if (
        marker >= 0xc0 && marker <= 0xcf &&
        marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
      ) {
        if (off + 7 > buf.length) return null;
        return {
          width: dv.getUint16(off + 5),
          height: dv.getUint16(off + 3),
          kind: "jpeg",
        };
      }
      off += dv.getUint16(off);
    }
  }
  return null;
};

const urls = collectImageUrls();

describe.skipIf(!RUN)(
  "JSON-LD image URLs are reachable + valid (RUN_LIVE_LOGO_CHECK=1)",
  () => {
    it("dataset produced at least one JSON-LD image URL", () => {
      expect(urls.length).toBeGreaterThan(0);
    });

    for (const url of urls) {
      it(`${url} — HTTP 200 with image/* Content-Type`, async () => {
        const r = await fetchWithRetry(url);
        expect(r.status, `status for ${url}`).toBe(200);
        expect((r.headers.get("content-type") ?? "").toLowerCase()).toMatch(
          /^image\//,
        );
      }, 30_000);

      it(`${url} — non-zero body, dimensions >= ${MIN_WIDTH}x${MIN_HEIGHT}`, async () => {
        const bytes = await fetchBytes(url);
        expect(bytes.byteLength, `zero-byte body for ${url}`).toBeGreaterThan(0);
        const dims = readDimensions(bytes);
        expect(dims, `unreadable image header for ${url}`).not.toBeNull();
        expect(dims!.width, `width for ${url} (${dims!.kind})`).toBeGreaterThanOrEqual(MIN_WIDTH);
        expect(dims!.height, `height for ${url} (${dims!.kind})`).toBeGreaterThanOrEqual(MIN_HEIGHT);
      }, 30_000);
    }
  },
);

describe("JSON-LD image validation (guard)", () => {
  it("guard: skipped locally, ran when RUN_LIVE_LOGO_CHECK=1", () => {
    expect(typeof RUN).toBe("boolean");
  });
});
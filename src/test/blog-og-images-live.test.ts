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
const MIN_WIDTH = Number(process.env.OG_MIN_WIDTH ?? 200);
const MIN_HEIGHT = Number(process.env.OG_MIN_HEIGHT ?? 200);

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

/**
 * Minimal image-header dimension parser for PNG, JPEG, GIF, and WebP (VP8/VP8L/VP8X).
 * Returns width/height in pixels, or null if the format is unrecognized/corrupt.
 * We only need to read the header, so a partial download is enough.
 */
const readDimensions = (
  buf: Uint8Array,
): { width: number; height: number; kind: string } | null => {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  // PNG: 89 50 4E 47 0D 0A 1A 0A, IHDR at offset 16 (width u32be, height u32be)
  if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: dv.getUint32(16), height: dv.getUint32(20), kind: "png" };
  }
  // GIF: "GIF87a"/"GIF89a", width u16le @ 6, height u16le @ 8
  if (buf.length >= 10 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return { width: dv.getUint16(6, true), height: dv.getUint16(8, true), kind: "gif" };
  }
  // WebP: "RIFF"...."WEBP"
  if (
    buf.length >= 30 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    const fourcc = String.fromCharCode(buf[12], buf[13], buf[14], buf[15]);
    if (fourcc === "VP8 ") {
      const w = dv.getUint16(26, true) & 0x3fff;
      const h = dv.getUint16(28, true) & 0x3fff;
      return { width: w, height: h, kind: "webp/vp8" };
    }
    if (fourcc === "VP8L" && buf.length >= 25) {
      const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
      const w = 1 + (((b1 & 0x3f) << 8) | b0);
      const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { width: w, height: h, kind: "webp/vp8l" };
    }
    if (fourcc === "VP8X" && buf.length >= 30) {
      const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      return { width: w, height: h, kind: "webp/vp8x" };
    }
  }
  // JPEG: FF D8 ... walk SOF markers
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) return null;
      // skip fill bytes
      while (buf[off] === 0xff && off < buf.length) off++;
      const marker = buf[off++];
      // SOF0..SOF15 except DHT/JPG/DAC (C4, C8, CC)
      if (
        marker >= 0xc0 && marker <= 0xcf &&
        marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
      ) {
        if (off + 7 > buf.length) return null;
        const height = dv.getUint16(off + 3);
        const width = dv.getUint16(off + 5);
        return { width, height, kind: "jpeg" };
      }
      const segLen = dv.getUint16(off);
      off += segLen;
    }
  }
  return null;
};

const fetchImageBytes = async (url: string): Promise<Uint8Array> => {
  // Range read of the header is enough for every supported format. Fall back
  // to a full GET if the origin ignores Range.
  let r = await fetch(url, {
    redirect: "follow",
    headers: { Range: "bytes=0-65535" },
  });
  if (!r.ok && r.status !== 206) {
    r = await fetch(url, { redirect: "follow" });
  }
  const ab = await r.arrayBuffer();
  return new Uint8Array(ab);
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

    it(`OG image is non-empty with valid dimensions >= ${MIN_WIDTH}x${MIN_HEIGHT}: ${url}`, async () => {
      const bytes = await fetchImageBytes(url);
      expect(bytes.byteLength, `zero-byte body for ${url}`).toBeGreaterThan(0);
      const dims = readDimensions(bytes);
      expect(
        dims,
        `could not decode image header for ${url} — likely corrupt or unsupported format`,
      ).not.toBeNull();
      expect(dims!.width, `width for ${url} (${dims!.kind})`).toBeGreaterThanOrEqual(MIN_WIDTH);
      expect(dims!.height, `height for ${url} (${dims!.kind})`).toBeGreaterThanOrEqual(MIN_HEIGHT);
    }, 30_000);
  }
});

// Always keep at least one assertion so the file is not "empty" when skipped.
describe("live OG image fetch (guard)", () => {
  it("guard: skipped locally, ran when RUN_LIVE_OG_CHECK=1", () => {
    expect(typeof RUN).toBe("boolean");
  });
});
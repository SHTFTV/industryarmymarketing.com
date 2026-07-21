import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const SLUG = "iam-perspective-committed-people-not-capital";
const HTML_PATH = resolve(`public/blog/${SLUG}.html`);
const html = readFileSync(HTML_PATH, "utf8");

const meta = (attr: "name" | "property", key: string): string | null => {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content="([^"]+)"`,
    "i",
  );
  return html.match(re)?.[1] ?? null;
};

describe(`blog post: ${SLUG}`, () => {
  it("published slug URL matches everywhere (route, canonical, sitemap, rss)", () => {
    const app = readFileSync(resolve("src/App.tsx"), "utf8");
    const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");
    const rss = readFileSync(resolve("public/rss.xml"), "utf8");
    const canonical = html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
    )?.[1];
    const expectedPath = `/blog/${SLUG}`;
    expect(canonical).toContain(expectedPath);
    expect(app).toContain(`path="${expectedPath}"`);
    expect(sitemap).toContain(`${expectedPath}</loc>`);
    expect(rss).toContain(expectedPath);
  });

  it("RSS enclosure matches the sitemap image entry (URL + type)", () => {
    const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");
    const rss = readFileSync(resolve("public/rss.xml"), "utf8");
    const smBlock = sitemap.match(
      new RegExp(`<url>\\s*<loc>[^<]*/blog/${SLUG}</loc>[\\s\\S]*?</url>`),
    )![0];
    const smImage = smBlock.match(/<image:loc>([^<]+)<\/image:loc>/)?.[1];
    expect(smImage).toBeTruthy();

    const item = rss.match(
      new RegExp(`<item>[\\s\\S]*?/blog/${SLUG}[\\s\\S]*?</item>`),
    )![0];
    const encUrl = item.match(/<enclosure[^>]+url=["']([^"']+)["']/)?.[1];
    const encType = item.match(/<enclosure[^>]+type=["']([^"']+)["']/)?.[1];
    expect(encUrl).toBe(smImage);
    // Type must be a valid image MIME matching the file extension
    expect(encType).toMatch(/^image\/(jpeg|png|webp)$/);
    const ext = smImage!.split(".").pop()!.toLowerCase();
    const extMime: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    expect(encType).toBe(extMime[ext]);
  });

  it("route is registered in src/App.tsx with the expected slug", () => {
    const app = readFileSync(resolve("src/App.tsx"), "utf8");
    expect(app).toContain(`path="/blog/${SLUG}"`);
    expect(app).toContain(`src="/blog/${SLUG}.html"`);
  });

  it("head has a real, non-template title and description", () => {
    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
    expect(title).toMatch(/IAM Perspective/i);
    expect(title).not.toMatch(/Lovable/i);
    const desc = meta("name", "description");
    expect(desc && desc.length).toBeGreaterThan(80);
  });

  it("canonical + og:url self-reference the route", () => {
    const canonical = html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
    )?.[1];
    expect(canonical).toBe(
      `https://www.industryarmymarketing.com/blog/${SLUG}`,
    );
    expect(meta("property", "og:url")).toBe(canonical);
  });

  it("emits Open Graph tags (title, description, type, image)", () => {
    expect(meta("property", "og:title")).toMatch(/Committed People/i);
    const ogDesc = meta("property", "og:description");
    expect(ogDesc && ogDesc.length).toBeGreaterThan(40);
    expect(meta("property", "og:type")).toBe("article");
    const ogImage = meta("property", "og:image");
    expect(ogImage).toMatch(/^https:\/\/.+\.(jpg|jpeg|png|webp)$/i);
  });

  it("emits Twitter Card tags", () => {
    expect(meta("name", "twitter:card")).toBe("summary_large_image");
    expect(meta("name", "twitter:title")).toBeTruthy();
    expect(meta("name", "twitter:description")).toBeTruthy();
    expect(meta("name", "twitter:image")).toMatch(/^https:\/\//);
  });

  it("emits valid BlogPosting JSON-LD", () => {
    const raw = [
      ...html.matchAll(
        /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ].map((m) => JSON.parse(m[1].trim()));
    expect(raw.length).toBeGreaterThan(0);
    const blog = raw.find(
      (s) => s && typeof s === "object" && s["@type"] === "BlogPosting",
    );
    expect(blog).toBeDefined();
    expect(blog.headline).toMatch(/Committed People/i);
    expect(blog.mainEntityOfPage).toBe(
      `https://www.industryarmymarketing.com/blog/${SLUG}`,
    );
    expect(blog.image).toMatch(/^https:\/\/.+\.(jpg|jpeg|png|webp)$/i);
    expect(Date.parse(blog.datePublished)).toBeGreaterThan(0);
    expect(blog.publisher?.name).toBeTruthy();
  });

  it("is listed in public/sitemap.xml with an image entry", () => {
    const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");
    const block = sitemap.match(
      new RegExp(
        `<url>\\s*<loc>[^<]*/blog/${SLUG}</loc>[\\s\\S]*?</url>`,
      ),
    );
    expect(block, "sitemap entry for slug").toBeTruthy();
    expect(block![0]).toContain("<image:image>");
  });

  it("is listed in public/rss.xml as an item", () => {
    const rss = readFileSync(resolve("public/rss.xml"), "utf8");
    expect(rss).toContain(
      `https://industryarmymarketing.com/blog/${SLUG}`,
    );
    const item = rss.match(
      new RegExp(
        `<item>[\\s\\S]*?/blog/${SLUG}[\\s\\S]*?</item>`,
      ),
    );
    expect(item).toBeTruthy();
    expect(item![0]).toMatch(/<pubDate>[^<]+<\/pubDate>/);
    expect(item![0]).toMatch(/<enclosure[^>]+type=["']image\//);
  });
});
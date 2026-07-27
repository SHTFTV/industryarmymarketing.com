import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { blogPosts } from "@/data/blogPosts";

// --- 1. Source of truth: routes defined in src/App.tsx ---
const APP_TSX = readFileSync("src/App.tsx", "utf8");
const ROUTE_RE = /<Route\s+path="([^"]+)"/g;
const DEFINED_ROUTES: string[] = [];
for (const m of APP_TSX.matchAll(ROUTE_RE)) DEFINED_ROUTES.push(m[1]);

const STATIC_ROUTES = new Set(DEFINED_ROUTES.filter((r) => !r.includes(":") && r !== "*"));
const DYNAMIC_ROUTES = DEFINED_ROUTES.filter((r) => r.includes(":"));
const HAS_CATCH_ALL = DEFINED_ROUTES.includes("*");

const BLOG_SLUGS = new Set(blogPosts.map((p) => p.slug));

// --- 2. Walk source tree ---
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if ([".ts", ".tsx"].includes(extname(name)) && !name.endsWith(".test.ts") && !name.endsWith(".test.tsx"))
      out.push(full);
  }
  return out;
}
const FILES = walk("src");

// --- 3. Validators ---
function matchesRoute(path: string): boolean {
  const clean = path.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  if (STATIC_ROUTES.has(clean)) return true;
  const segs = clean.split("/");
  return DYNAMIC_ROUTES.some((r) => {
    const rs = r.split("/");
    if (rs.length !== segs.length) return false;
    return rs.every((s, i) => s.startsWith(":") || s === segs[i]);
  });
}

function isPublicAsset(path: string): boolean {
  const clean = path.split("?")[0].split("#")[0];
  if (!/\.[a-z0-9]{2,5}$/i.test(clean)) return false;
  return existsSync(join("public", clean));
}

// --- 4. Scan ---
const LINK_TO_RE = /\b(?:to|href)\s*=\s*"(\/[^"\s]*)"/g;
const EXTERNAL_A_RE = /<a\b([^>]*?)href\s*=\s*"(https?:\/\/[^"]+)"([^>]*)>/g;

type DeadLink = { file: string; target: string };
type ExtIssue = { file: string; url: string; reason: string };

const deadLinks: DeadLink[] = [];
const extIssues: ExtIssue[] = [];

for (const file of FILES) {
  const src = readFileSync(file, "utf8");

  for (const m of src.matchAll(LINK_TO_RE)) {
    const target = m[1];
    if (target.startsWith("//")) continue;
    const clean = target.split("?")[0].split("#")[0];
    // Blog slug check
    const blogMatch = clean.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
      if (!BLOG_SLUGS.has(blogMatch[1])) deadLinks.push({ file, target });
      continue;
    }
    if (matchesRoute(clean)) continue;
    if (isPublicAsset(clean)) continue;
    if (HAS_CATCH_ALL && clean === "*") continue;
    deadLinks.push({ file, target });
  }

  for (const m of src.matchAll(EXTERNAL_A_RE)) {
    const attrs = (m[1] || "") + " " + (m[3] || "");
    const url = m[2];
    // Skip dynamic template-literal URLs (e.g. copy-snippet generators)
    if (url.includes("${")) continue;
    const hasBlank = /target\s*=\s*"_blank"/.test(attrs);
    const relMatch = attrs.match(/rel\s*=\s*"([^"]+)"/);
    const rel = relMatch ? relMatch[1] : "";
    if (!hasBlank) extIssues.push({ file, url, reason: 'missing target="_blank"' });
    if (!/\bnoopener\b/.test(rel)) extIssues.push({ file, url, reason: 'rel missing noopener' });
    if (!/\bnoreferrer\b/.test(rel)) extIssues.push({ file, url, reason: 'rel missing noreferrer' });
  }
}

describe("link audit (CI regression)", () => {
  it("App.tsx defines routes", () => {
    expect(DEFINED_ROUTES.length).toBeGreaterThan(10);
  });

  it("has no dead internal links", () => {
    if (deadLinks.length) {
      const msg = deadLinks.map((d) => `  ${d.file} -> ${d.target}`).join("\n");
      throw new Error(`Dead internal links found:\n${msg}`);
    }
    expect(deadLinks).toEqual([]);
  });

  it("external <a> tags have target=_blank and rel='noopener noreferrer'", () => {
    if (extIssues.length) {
      const msg = extIssues.map((e) => `  ${e.file} [${e.url}] ${e.reason}`).join("\n");
      throw new Error(`External link hygiene issues:\n${msg}`);
    }
    expect(extIssues).toEqual([]);
  });
});
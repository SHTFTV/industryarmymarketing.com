import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// CI guard: ensures BlogPost.tsx keeps the AIIndexing import + all three
// required props (articleTitle, articleUrl, publication) wired up.
// TypeScript already enforces prop types at build time via the
// AIIndexingProps interface — this test guarantees the JSX usage itself
// isn't silently deleted or spread-only in a future refactor.
describe("BlogPost AIIndexing wiring", () => {
  const source = readFileSync(
    resolve(__dirname, "BlogPost.tsx"),
    "utf8",
  );

  it("imports AIIndexing from @/components/AIIndexing", () => {
    expect(source).toMatch(
      /import\s*\{\s*AIIndexing\s*\}\s*from\s*["']@\/components\/AIIndexing["']/,
    );
  });

  it("renders <AIIndexing …/> in the page tree", () => {
    expect(source).toMatch(/<AIIndexing[\s>]/);
  });

  it("passes articleTitle, articleUrl, and publication as explicit props", () => {
    const match = source.match(/<AIIndexing\b([\s\S]*?)\/>/);
    expect(match, "AIIndexing JSX element must be self-closed").toBeTruthy();
    const propsBlob = match![1];
    expect(propsBlob).toMatch(/\barticleTitle\s*=/);
    expect(propsBlob).toMatch(/\barticleUrl\s*=/);
    expect(propsBlob).toMatch(/\bpublication\s*=/);
  });

  it("pins articleUrl to the shared canonical SITE_URL/blog/{slug}", () => {
    expect(source).toMatch(
      /articleUrl=\{`\$\{SITE_URL\}\/blog\/\$\{post\.slug\}`\}/,
    );
  });

  it("uses the 'iam' publication brand", () => {
    expect(source).toMatch(/publication\s*=\s*["']iam["']/);
  });
});
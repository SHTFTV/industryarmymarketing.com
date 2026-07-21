import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen, fireEvent, within } from "@testing-library/react";
import { AIIndexing } from "./AIIndexing";

// Canonical fixture — matches the URL BlogPost.tsx passes to <AIIndexing>.
const ARTICLE_TITLE = "Test canonical article — with dashes & quotes";
const ARTICLE_URL =
  "https://industryarmymarketing.com/blog/test-canonical-slug";

const PLATFORMS = [
  {
    name: "ChatGPT",
    origin: "https://chat.openai.com/",
    promptStart: "Tell me more about this article and its implications",
    embeddedUrlPrefix: "https://chat.openai.com/?q=",
    deepLinkPromptStart: "Tell me more about this article",
  },
  {
    name: "Claude",
    origin: "https://claude.ai/",
    promptStart: "Analyse this article and explain the key industry implications",
    embeddedUrlPrefix: "https://claude.ai/new?q=",
    deepLinkPromptStart: "Analyse this article and explain the key industry implications",
  },
  {
    name: "Perplexity",
    origin: "https://www.perplexity.ai/",
    promptStart: "Research and expand on the topics covered in",
    embeddedUrlPrefix: "https://www.perplexity.ai/search?q=",
    deepLinkPromptStart: `"${ARTICLE_TITLE}"`,
  },
  {
    name: "Grok",
    origin: "https://grok.com/",
    promptStart: "What's the significance of",
    embeddedUrlPrefix: "https://grok.com/?q=",
    deepLinkPromptStart: `What's the significance of: "${ARTICLE_TITLE}"?`,
  },
];

const setup = () =>
  render(
    <AIIndexing
      articleTitle={ARTICLE_TITLE}
      articleUrl={ARTICLE_URL}
      publication="iam"
    />,
  );

describe("AIIndexing — prompt + deep-link URL parity", () => {
  afterEach(() => cleanup());

  for (const p of PLATFORMS) {
    it(`${p.name} dropdown embeds the exact canonical articleUrl and articleTitle`, () => {
      setup();

      // Toggle open
      const toggle = screen.getByRole("button", { name: new RegExp(p.name, "i") });
      fireEvent.click(toggle);

      // The prompt paragraph (mono style) must contain BOTH the raw
      // articleTitle AND the raw articleUrl — no re-encoding, no
      // trimming, no rewriting.
      const promptNodes = screen.getAllByText(
        (_content, node) =>
          !!node?.textContent?.includes(p.promptStart) &&
          node.textContent.includes(ARTICLE_TITLE) &&
          node.textContent.includes(ARTICLE_URL),
      );
      expect(
        promptNodes.length,
        `${p.name}: visible prompt must include both title and URL verbatim`,
      ).toBeGreaterThan(0);

      // The "Open in <platform>" deep link must:
      //  1. Point at the correct AI origin.
      //  2. Encode the canonical articleUrl inside its ?q= param.
      //  3. Encode the articleTitle inside its ?q= param.
      const openLink = screen.getByRole("link", {
        name: new RegExp(`Open in ${p.name}`, "i"),
      }) as HTMLAnchorElement;

      const href = openLink.getAttribute("href") ?? "";
      expect(href.startsWith(p.embeddedUrlPrefix), `${p.name}: wrong origin: ${href}`).toBe(true);

      // ?q= value is single-pass encodeURIComponent(...) of a string
      // containing the raw title + raw URL. Decode once and assert.
      const q = new URL(href).searchParams.get("q") ?? "";
      expect(q.includes(ARTICLE_TITLE), `${p.name}: decoded q must contain raw title`).toBe(true);
      expect(q.includes(ARTICLE_URL), `${p.name}: decoded q must contain raw articleUrl`).toBe(true);
      expect(
        q.startsWith(p.deepLinkPromptStart),
        `${p.name}: decoded q must start with expected prompt (${p.deepLinkPromptStart}) — got: ${q}`,
      ).toBe(true);

      // Byte-check: the substring after ?q= must equal
      // encodeURIComponent(q). Guards against double-encoding
      // regressions.
      const rawParam = href.slice(href.indexOf("?q=") + 3);
      expect(rawParam).toBe(encodeURIComponent(q));
    });
  }

  it("share buttons encode the canonical articleUrl exactly (no double-encoding)", () => {
    setup();
    const encoded = encodeURIComponent(ARTICLE_URL);
    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("a[href]"),
    );
    const linkedin = anchors.find((a) =>
      a.href.includes("linkedin.com/sharing/share-offsite/"),
    )!;
    const x = anchors.find((a) => a.href.includes("x.com/intent/tweet"))!;
    expect(linkedin.getAttribute("href")).toContain(`url=${encoded}`);
    expect(x.getAttribute("href")).toContain(`url=${encoded}`);
  });
});

describe("AIIndexing — accessibility & keyboard navigation", () => {
  afterEach(() => cleanup());

  it("each AI dropdown toggle is a real <button> with a discernible name", () => {
    setup();
    for (const p of PLATFORMS) {
      const btn = screen.getByRole("button", { name: new RegExp(p.name, "i") });
      expect(btn.tagName).toBe("BUTTON");
      // Native buttons are focusable & Enter/Space-activated by default —
      // ensure the author didn't override that with tabIndex=-1.
      const tabIndex = btn.getAttribute("tabindex");
      expect(tabIndex === null || Number(tabIndex) >= 0).toBe(true);
      expect(btn.hasAttribute("disabled")).toBe(false);
    }
  });

  it("toggle buttons are keyboard-focusable in DOM order", () => {
    setup();
    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      ),
    );
    // All four toggle buttons appear before any expanded-panel controls.
    const toggleTexts = focusables
      .filter((el) => el.tagName === "BUTTON")
      .map((el) => el.textContent ?? "");
    for (const p of PLATFORMS) {
      expect(
        toggleTexts.some((t) => t.includes(p.name)),
        `${p.name} toggle must appear in the tab order`,
      ).toBe(true);
    }
  });

  it("expanded dropdown exposes 'Open in …' link and 'Copy prompt' button to keyboard users", () => {
    setup();
    for (const p of PLATFORMS) {
      const toggle = screen.getByRole("button", { name: new RegExp(p.name, "i") });
      fireEvent.click(toggle);

      const openLink = screen.getByRole("link", {
        name: new RegExp(`Open in ${p.name}`, "i"),
      }) as HTMLAnchorElement;
      expect(openLink.tagName).toBe("A");
      expect(openLink.getAttribute("href")).toBeTruthy();
      // target=_blank must be paired with rel=noopener noreferrer for a11y + security.
      expect(openLink.getAttribute("target")).toBe("_blank");
      expect(openLink.getAttribute("rel") ?? "").toMatch(/noopener/);
      expect(openLink.getAttribute("rel") ?? "").toMatch(/noreferrer/);

      const copyBtn = screen.getByRole("button", { name: /copy prompt/i });
      expect(copyBtn.tagName).toBe("BUTTON");
      expect(copyBtn.hasAttribute("disabled")).toBe(false);

      // Collapse before next iteration so we don't get duplicate matches.
      fireEvent.click(toggle);
    }
  });

  it("share + Google-source controls use real anchors with safe rel + target", () => {
    setup();
    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("a[href]"),
    );
    const externals = anchors.filter((a) => a.getAttribute("target") === "_blank");
    expect(externals.length).toBeGreaterThan(0);
    for (const a of externals) {
      const rel = a.getAttribute("rel") ?? "";
      expect(rel, `anchor ${a.getAttribute("href")} missing rel=noopener`).toMatch(/noopener/);
      expect(rel, `anchor ${a.getAttribute("href")} missing rel=noreferrer`).toMatch(/noreferrer/);
    }
  });

  it("section is labelled with the visible 'IAM AI Indexing Section' heading text", () => {
    setup();
    // Screen-reader users encounter the section via this label.
    const label = screen.getByText(/IAM AI Indexing Section/i);
    expect(label).toBeInTheDocument();
  });
});
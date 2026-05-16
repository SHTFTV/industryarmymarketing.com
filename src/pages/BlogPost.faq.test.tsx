import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, within, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "./BlogPost";
import { blogPosts } from "@/data/blogPosts";

const renderPost = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog/${slug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

type FaqSchema = {
  "@context"?: string;
  "@type": string;
  mainEntity: Array<{
    "@type": string;
    name: string;
    acceptedAnswer?: { "@type": string; text: string };
  }>;
};

const getFaqSchema = (): FaqSchema | null => {
  const scripts = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]')
  );
  for (const s of scripts) {
    try {
      const json = JSON.parse(s.textContent || "");
      if (json["@type"] === "FAQPage") return json as FaqSchema;
    } catch {
      /* ignore */
    }
  }
  return null;
};

describe("BlogPost FAQ rendering matches FAQPage JSON-LD", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const post of blogPosts) {
    it(`/${post.slug}: rendered FAQ questions match JSON-LD Question names`, async () => {
      const { container } = renderPost(post.slug);

      // Wait for Helmet to flush JSON-LD into document.head
      await new Promise((r) => setTimeout(r, 0));

      const heading = Array.from(container.querySelectorAll("h2")).find((h) =>
        h.textContent?.startsWith("Frequently asked")
      );
      expect(heading, `FAQ heading missing on /blog/${post.slug}`).toBeTruthy();

      const faqSection = heading!.parentElement as HTMLElement;
      const renderedQuestions = Array.from(
        within(faqSection).getAllByRole("heading", { level: 3 })
      ).map((h) => h.textContent?.trim() ?? "");

      const schema = getFaqSchema();
      expect(schema, `FAQPage JSON-LD missing on /blog/${post.slug}`).toBeTruthy();
      expect(schema!["@type"]).toBe("FAQPage");
      expect(Array.isArray(schema!.mainEntity)).toBe(true);
      expect(schema!.mainEntity.length).toBe(post.faqs.length);

      for (const [i, entity] of schema!.mainEntity.entries()) {
        expect(entity["@type"]).toBe("Question");
        expect(entity.name).toBe(post.faqs[i].q);
        expect(entity.acceptedAnswer).toBeDefined();
        expect(entity.acceptedAnswer!["@type"]).toBe("Answer");
        expect(entity.acceptedAnswer!.text).toBe(post.faqs[i].a);
      }

      const schemaQuestions = schema!.mainEntity.map((q) => q.name);
      const dataQuestions = post.faqs.map((f) => f.q);
      expect(renderedQuestions).toEqual(dataQuestions);
      expect(schemaQuestions).toEqual(dataQuestions);
      expect(renderedQuestions).toEqual(schemaQuestions);
    });
  }

  for (const post of blogPosts) {
    it(`/${post.slug}: a FAQPage JSON-LD script is present with correct @type`, async () => {
      renderPost(post.slug);

      const scripts = await waitFor(() => {
        const found = Array.from(
          document.querySelectorAll('script[type="application/ld+json"]')
        );
        expect(
          found.length,
          `No JSON-LD scripts emitted on /blog/${post.slug}`
        ).toBeGreaterThan(0);
        return found;
      });

      const parsed = scripts
        .map((s) => {
          try {
            return JSON.parse(s.textContent || "");
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      const faqSchemas = parsed.filter((j) => j["@type"] === "FAQPage");
      expect(
        faqSchemas.length,
        `Expected exactly one FAQPage JSON-LD on /blog/${post.slug}, found ${faqSchemas.length}`
      ).toBe(1);

      const faq = faqSchemas[0];
      expect(faq["@context"]).toBe("https://schema.org");
      expect(faq["@type"]).toBe("FAQPage");
      expect(faq["@type"]).not.toBe("FAQ");
      expect(faq["@type"]).not.toBe("QAPage");
    });
  }
});
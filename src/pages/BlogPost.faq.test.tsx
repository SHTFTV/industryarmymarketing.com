import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, within } from "@testing-library/react";
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

const collectFaqSchemaQuestions = (): string[] => {
  const scripts = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]')
  );
  for (const s of scripts) {
    try {
      const json = JSON.parse(s.textContent || "");
      if (json["@type"] === "FAQPage" && Array.isArray(json.mainEntity)) {
        return json.mainEntity.map((q: { name: string }) => q.name);
      }
    } catch {
      /* ignore */
    }
  }
  return [];
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

      const schemaQuestions = collectFaqSchemaQuestions();
      const dataQuestions = post.faqs.map((f) => f.q);

      expect(renderedQuestions).toEqual(dataQuestions);
      expect(schemaQuestions).toEqual(dataQuestions);
      expect(renderedQuestions).toEqual(schemaQuestions);
    });
  }
});
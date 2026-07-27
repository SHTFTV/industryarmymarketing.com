// Dedicated ordering test: for every blog post, assert positional parity
// between (1) the source post.faqs array, (2) the rendered <h3> question
// nodes in the DOM FAQ section, and (3) the FAQPage JSON-LD mainEntity[].
// Failing this test means Google/Bing/AI Overview will read a different
// order than the human visitor — a known cause of rich-result demotion.

import { describe, it, expect, beforeEach } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPost from "./BlogPost";
import { blogPosts } from "@/data/blogPosts";

type Faq = { "@type": "Question"; name: string; acceptedAnswer: { "@type": "Answer"; text: string } };

const renderPost = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog/${slug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

const readFaqSchema = async (): Promise<Faq[]> => {
  return await waitFor(() => {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    for (const s of scripts) {
      try {
        const json = JSON.parse(s.textContent || "");
        if (json["@type"] === "FAQPage" && Array.isArray(json.mainEntity)) {
          return json.mainEntity as Faq[];
        }
      } catch {
        /* ignore parse errors */
      }
    }
    throw new Error("FAQPage JSON-LD not yet present");
  });
};

describe("BlogPost FAQ ordering — source ↔ DOM ↔ JSON-LD parity", () => {
  beforeEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const post of blogPosts) {
    it(`/${post.slug}: FAQ question order is stable across source, DOM, and schema`, async () => {
      const { container } = renderPost(post.slug);

      const sourceQuestions = post.faqs.map((f) => f.q);
      const sourceAnswers = post.faqs.map((f) => f.a);

      // 1. Rendered DOM order inside the FAQ section
      const faqHeading = Array.from(container.querySelectorAll("h2")).find((h) =>
        h.textContent?.startsWith("Frequently asked"),
      );
      expect(faqHeading, `FAQ heading missing on /blog/${post.slug}`).toBeTruthy();
      const domQuestions = Array.from(
        within(faqHeading!.parentElement as HTMLElement).getAllByRole("heading", { level: 3 }),
      ).map((h) => h.textContent?.trim() ?? "");

      // 2. JSON-LD FAQPage order (async because Helmet flushes on effect)
      const schema = await readFaqSchema();
      const schemaQuestions = schema.map((q) => q.name);
      const schemaAnswers = schema.map((q) => q.acceptedAnswer.text);

      // Positional parity — every index must match
      expect(domQuestions).toEqual(sourceQuestions);
      expect(schemaQuestions).toEqual(sourceQuestions);
      expect(schemaAnswers).toEqual(sourceAnswers);

      // Belt-and-braces: index-by-index Question/Answer pairing
      for (let i = 0; i < sourceQuestions.length; i++) {
        expect(schema[i]["@type"]).toBe("Question");
        expect(schema[i].name).toBe(sourceQuestions[i]);
        expect(schema[i].acceptedAnswer["@type"]).toBe("Answer");
        expect(schema[i].acceptedAnswer.text).toBe(sourceAnswers[i]);
      }
    });
  }
});
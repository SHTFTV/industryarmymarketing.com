import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SEO_PACKAGES } from "@/data/seoPackages";

const trackMock = vi.fn();
vi.mock("@/lib/analytics", () => ({
  track: (...args: unknown[]) => trackMock(...args),
}));

// Force reduced motion for a subset of tests
const reducedMotionMock = vi.fn(() => false);
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => reducedMotionMock(),
  };
});

import SeoPackagesCompare from "./SeoPackagesCompare";

const renderSection = () =>
  render(
    <MemoryRouter>
      <SeoPackagesCompare />
    </MemoryRouter>,
  );

describe("SeoPackagesCompare — a11y + analytics + reduced motion", () => {
  beforeEach(() => {
    cleanup();
    trackMock.mockReset();
    reducedMotionMock.mockReturnValue(false);
  });

  it("renders a labelled comparison table with a per-package column header", () => {
    renderSection();
    const table = screen.getByRole("table");
    expect(table).toHaveAccessibleDescription();
    for (const pkg of SEO_PACKAGES) {
      expect(
        within(table).getByRole("columnheader", { name: new RegExp(pkg.name, "i") }),
      ).toBeInTheDocument();
    }
  });

  it("each package CTA has a descriptive aria-label, routes to its detail page, and is keyboard-focusable", () => {
    renderSection();
    for (const pkg of SEO_PACKAGES) {
      const link = screen.getByTestId(`home-compare-cta-${pkg.slug}`);
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", `/seo-packages/${pkg.slug}`);
      const label = link.getAttribute("aria-label") ?? "";
      expect(label).toContain(pkg.name);
      expect(label).toContain(pkg.tagline);
      expect(label).toContain(String(pkg.price));
      expect(link.getAttribute("tabindex")).not.toBe("-1");
      expect(link.className).toMatch(/focus-visible:ring/);
      link.focus();
      expect(document.activeElement).toBe(link);
    }
  });

  it("comparison CTAs fire home_package_cta_click with slug + label + compare source", () => {
    renderSection();
    for (const pkg of SEO_PACKAGES) {
      trackMock.mockClear();
      fireEvent.click(screen.getByTestId(`home-compare-cta-${pkg.slug}`));
      expect(trackMock).toHaveBeenCalledWith("home_package_cta_click", {
        packageSlug: pkg.slug,
        meta: expect.objectContaining({
          label: pkg.name,
          price: pkg.price,
          source: "home_seo_packages_compare",
        }),
      });
    }
  });

  it("FAQ block renders questions/answers and both CTAs, each with focus rings + aria-labels", () => {
    renderSection();
    const faq = screen.getByRole("complementary", {
      name: /budget questions, answered/i,
    });
    // 4 <dt>/<dd> pairs
    expect(within(faq).getAllByRole("term")).toHaveLength(4);
    expect(within(faq).getAllByRole("definition")).toHaveLength(4);

    const budgetCta = screen.getByTestId("home-compare-faq-cta-contact");
    const compareCta = screen.getByTestId("home-compare-faq-cta-compare");
    expect(budgetCta).toHaveAttribute("href", "/contact");
    expect(compareCta).toHaveAttribute("href", "/seo-packages");
    for (const cta of [budgetCta, compareCta]) {
      expect(cta.getAttribute("aria-label")).toBeTruthy();
      expect(cta.className).toMatch(/focus-visible:ring/);
      cta.focus();
      expect(document.activeElement).toBe(cta);
    }
  });

  it("FAQ CTAs fire home_compare_faq_cta_click with label + target metadata", () => {
    renderSection();
    trackMock.mockClear();
    fireEvent.click(screen.getByTestId("home-compare-faq-cta-contact"));
    expect(trackMock).toHaveBeenCalledWith("home_compare_faq_cta_click", {
      meta: expect.objectContaining({
        label: "Tell us your budget",
        source: "home_seo_packages_compare_faq",
        target: "/contact",
      }),
    });
    trackMock.mockClear();
    fireEvent.click(screen.getByTestId("home-compare-faq-cta-compare"));
    expect(trackMock).toHaveBeenCalledWith("home_compare_faq_cta_click", {
      meta: expect.objectContaining({
        label: "Compare all packages",
        source: "home_seo_packages_compare_faq",
        target: "/seo-packages",
      }),
    });
  });

  it("Tab order reaches every package CTA and both FAQ CTAs in DOM order", () => {
    renderSection();
    const expectedTestIds = [
      ...SEO_PACKAGES.map((p) => `home-compare-cta-${p.slug}`),
      "home-compare-faq-cta-contact",
      "home-compare-faq-cta-compare",
    ];
    const allLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("a[data-testid^='home-compare-']"),
    );
    const seen = allLinks.map((el) => el.getAttribute("data-testid"));
    for (const id of expectedTestIds) {
      expect(seen).toContain(id);
    }
    // Every one of them is a native anchor without tabindex="-1"
    for (const el of allLinks) {
      expect(el.tagName).toBe("A");
      expect(el.getAttribute("tabindex")).not.toBe("-1");
    }
  });

  it("with prefers-reduced-motion, still renders every CTA with visible focus rings", () => {
    reducedMotionMock.mockReturnValue(true);
    renderSection();
    for (const pkg of SEO_PACKAGES) {
      const link = screen.getByTestId(`home-compare-cta-${pkg.slug}`);
      expect(link).toBeInTheDocument();
      expect(link.className).toMatch(/focus-visible:ring/);
      link.focus();
      expect(document.activeElement).toBe(link);
    }
    // FAQ CTAs also present + focusable under reduced motion
    for (const testId of [
      "home-compare-faq-cta-contact",
      "home-compare-faq-cta-compare",
    ]) {
      const link = screen.getByTestId(testId);
      expect(link.className).toMatch(/focus-visible:ring/);
      link.focus();
      expect(document.activeElement).toBe(link);
    }
  });

  it("with prefers-reduced-motion, headline + featured column omit neon shadow via motion-reduce utilities", () => {
    reducedMotionMock.mockReturnValue(true);
    renderSection();
    const heading = screen.getByRole("heading", { name: /compare the arsenal/i });
    // motion-reduce:[text-shadow:none] must be present so neon glow is suppressed
    expect(heading.className).toMatch(/motion-reduce:\[text-shadow:none\]/);
    // Motion-safe / motion-reduce utilities gate CTA arrow transitions
    const bomb = screen.getByTestId("home-compare-cta-boom");
    const arrow = bomb.querySelector("svg.lucide-arrow-right");
    expect(arrow?.getAttribute("class") ?? "").toMatch(/motion-safe:transition-transform/);
  });
});

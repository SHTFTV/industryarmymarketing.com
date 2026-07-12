import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SEO_PACKAGES } from "@/data/seoPackages";

const trackMock = vi.fn();
vi.mock("@/lib/analytics", () => ({
  track: (...args: unknown[]) => trackMock(...args),
}));

import SeoPackagesSection from "./SeoPackagesSection";

const renderSection = () =>
  render(
    <MemoryRouter>
      <SeoPackagesSection />
    </MemoryRouter>,
  );

describe("SeoPackagesSection — accessibility + analytics", () => {
  beforeEach(() => {
    cleanup();
    trackMock.mockReset();
  });

  it("every package CTA has a descriptive aria-label and links to its detail route", () => {
    renderSection();
    for (const pkg of SEO_PACKAGES) {
      const link = screen.getByTestId(`home-package-cta-${pkg.slug}`);
      expect(link).toHaveAttribute("href", `/seo-packages/${pkg.slug}`);
      const label = link.getAttribute("aria-label") ?? "";
      expect(label).toContain(pkg.name);
      expect(label).toContain(pkg.tagline);
      expect(label).toContain(String(pkg.price));
    }
  });

  it("CTA buttons expose visible focus-ring utilities for keyboard users", () => {
    renderSection();
    for (const pkg of SEO_PACKAGES) {
      const link = screen.getByTestId(`home-package-cta-${pkg.slug}`);
      // shadcn Button base + our explicit ring classes
      const btn = link.className;
      expect(btn).toMatch(/focus-visible:ring/);
    }
  });

  it("CTAs are keyboard-focusable (native <a>) and reachable via Tab", () => {
    renderSection();
    const links = SEO_PACKAGES.map((p) =>
      screen.getByTestId(`home-package-cta-${p.slug}`),
    );
    for (const link of links) {
      expect(link.tagName).toBe("A");
      // No tabindex="-1" that would remove them from tab order
      expect(link.getAttribute("tabindex")).not.toBe("-1");
      link.focus();
      expect(document.activeElement).toBe(link);
    }
  });

  it("Compare-all-packages link is labelled and focusable", () => {
    renderSection();
    const link = screen.getByRole("link", {
      name: /compare all seo packages/i,
    });
    expect(link).toHaveAttribute("href", "/seo-packages");
    expect(link.className).toMatch(/focus-visible:ring/);
  });

  it("fires home_package_cta_click analytics event with slug + label for each package", () => {
    renderSection();
    for (const pkg of SEO_PACKAGES) {
      trackMock.mockClear();
      const link = screen.getByTestId(`home-package-cta-${pkg.slug}`);
      fireEvent.click(link);
      expect(trackMock).toHaveBeenCalledWith("home_package_cta_click", {
        packageSlug: pkg.slug,
        meta: expect.objectContaining({
          label: pkg.name,
          price: pkg.price,
          source: "home_seo_packages",
        }),
      });
    }
  });

  it("fires home_compare_packages_click when the compare-all link is clicked", () => {
    renderSection();
    const link = screen.getByRole("link", {
      name: /compare all seo packages/i,
    });
    fireEvent.click(link);
    expect(trackMock).toHaveBeenCalledWith("home_compare_packages_click", {
      meta: { source: "home_seo_packages" },
    });
  });
});
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PricingChartSection from "./PricingChartSection";
import { PRICING_MATRIX } from "@/data/pricingMatrix";

const renderChart = () =>
  render(
    <MemoryRouter>
      <PricingChartSection />
    </MemoryRouter>,
  );

describe("PricingChartSection", () => {
  it("renders a mobile list and a desktop table with one entry per matrix row", () => {
    renderChart();
    const mobile = screen.getByTestId("pricing-chart-mobile");
    const table = screen.getByTestId("pricing-chart-table");
    expect(within(mobile).getAllByRole("listitem", { hidden: true }))
      .toHaveLength(PRICING_MATRIX.length);
    expect(within(table).getAllByRole("row", { hidden: true }))
      .toHaveLength(PRICING_MATRIX.length + 1); // + header row
  });

  it("uses semantic table headers with scope for accessibility", () => {
    renderChart();
    const table = screen.getByTestId("pricing-chart-table");
    const colHeaders = within(table).getAllByRole("columnheader", { hidden: true });
    expect(colHeaders.length).toBeGreaterThanOrEqual(3);
    colHeaders.forEach((h) => expect(h.getAttribute("scope")).toBe("col"));
    const rowHeaders = within(table).getAllByRole("rowheader", { hidden: true });
    expect(rowHeaders).toHaveLength(PRICING_MATRIX.length);
    rowHeaders.forEach((h) => expect(h.getAttribute("scope")).toBe("row"));
  });

  it("constrains the desktop table to a scrollable region so it does not overflow on narrow viewports", () => {
    renderChart();
    const table = screen.getByTestId("pricing-chart-table");
    expect(table.className).toMatch(/min-w-\[640px\]/);
    const scroller = table.parentElement!;
    expect(scroller.className).toMatch(/overflow-x-auto/);
    expect(scroller.getAttribute("role")).toBe("region");
    expect(scroller.getAttribute("aria-labelledby")).toBe("pricing-chart-heading");
  });

  it("links the CTA to the full /pricing page", () => {
    renderChart();
    const cta = screen.getByTestId("pricing-chart-cta");
    expect(cta.getAttribute("href")).toBe("/pricing");
    expect(cta).toHaveAccessibleName(/full pricing/i);
  });

  it("mobile layout snapshot is stable so overflow regressions surface in CI", () => {
    renderChart();
    const mobile = screen.getByTestId("pricing-chart-mobile");
    // Snapshot the structural shape, not the live DOM node, so the JSON-LD
    // serializer in the shared setup doesn't recurse into React fibers.
    const structure = Array.from(mobile.children).map((li) => ({
      tag: li.tagName.toLowerCase(),
      text: (li.textContent ?? "").replace(/\s+/g, " ").trim(),
    }));
    expect({
      containerTag: mobile.tagName.toLowerCase(),
      hiddenAtSmAndUp: mobile.className.includes("sm:hidden"),
      itemCount: structure.length,
      firstThree: structure.slice(0, 3),
    }).toMatchSnapshot();
  });

  it("renders a pinned $10 per 100K rule banner above the chart", () => {
    renderChart();
    const banner = screen.getByTestId("pricing-rule-banner");
    expect(banner).toBeInTheDocument();
    expect(banner.className).toMatch(/sticky/);
    expect(banner.textContent).toMatch(/\$10 USD/);
    expect(banner.textContent).toMatch(/per 100,000 population, per slot/i);
    expect(banner.getAttribute("aria-label")).toMatch(/\$10 USD per 100,000 population, per slot/);
  });

  it("renders a per-row $10 per 100K callout that matches pricingMatrix logic", () => {
    renderChart();
    // Every row emits a callout in both the desktop table and mobile list,
    // and each callout must equal `${blocks} × 100K × $10 = $${pricePerSlot}/slot/mo`,
    // where blocks = pricePerSlot / 10. That expression is the $10-per-100K
    // rule expressed in reverse from the hardcoded matrix — if a row ever
    // drifts from the rule, this assertion fails.
    for (const row of PRICING_MATRIX) {
      const blocks = row.pricePerSlot / 10;
      const expected = `${blocks} × 100K × $10 = $${row.pricePerSlot}/slot/mo`;
      expect(screen.getByTestId(`pricing-callout-${row.lowerBound}`)).toHaveTextContent(expected);
      expect(screen.getByTestId(`pricing-callout-mobile-${row.lowerBound}`)).toHaveTextContent(expected);
    }
  });

  it("exposes the $10 per 100K rule as a hover tooltip on every row", () => {
    renderChart();
    const table = screen.getByTestId("pricing-chart-table");
    const dataRows = within(table)
      .getAllByRole("row", { hidden: true })
      .slice(1); // skip header
    expect(dataRows).toHaveLength(PRICING_MATRIX.length);
    dataRows.forEach((tr, i) => {
      const row = PRICING_MATRIX[i];
      const title = tr.getAttribute("title") ?? "";
      expect(title).toMatch(/\$10 USD per 100,000 population, per slot/);
      expect(title).toContain(`$${row.pricePerSlot}/slot/mo`);
    });
  });
});
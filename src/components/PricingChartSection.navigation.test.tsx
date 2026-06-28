import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import PricingChartSection from "./PricingChartSection";

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="loc">{loc.pathname}</div>;
}

const ROUTES_TO_TEST = ["/", "/contractors", "/blog", "/investors", "/how-it-works"];

describe("PricingChartSection CTA navigation", () => {
  it.each(ROUTES_TO_TEST)(
    "navigates to /pricing when the CTA is clicked from %s",
    async (initialRoute) => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route
              path="*"
              element={
                <>
                  <PricingChartSection />
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByTestId("loc").textContent).toBe(initialRoute);
      const cta = screen.getByTestId("pricing-chart-cta");
      expect(cta.getAttribute("href")).toBe("/pricing");
      await user.click(cta);
      expect(screen.getByTestId("loc").textContent).toBe("/pricing");
    },
  );
});
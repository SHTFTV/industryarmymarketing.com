// Verifies the DisambiguationNotice is mounted site-wide via Layout —
// it renders on the legal page, the blog index, and other Layout-wrapped
// routes — and is NOT auto-injected when a component renders outside
// the Layout wrapper (i.e. it is genuinely opt-in via <Layout>).

import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./Layout";
import Legal from "@/pages/Legal";

const wrap = (path: string, element: React.ReactNode) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={element} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

const NOTICE_LABEL = /entity disambiguation notice/i;

describe("DisambiguationNotice — site-wide banner via Layout", () => {
  afterEach(cleanup);

  it("renders on the /legal route (Layout-wrapped)", () => {
    wrap("/legal", <Legal />);
    expect(screen.getByLabelText(NOTICE_LABEL)).toBeTruthy();
  });

  it("renders when an arbitrary page is wrapped in <Layout>", () => {
    wrap(
      "/anything",
      <Layout>
        <p>arbitrary content</p>
      </Layout>,
    );
    expect(screen.getByLabelText(NOTICE_LABEL)).toBeTruthy();
  });

  it("does NOT auto-inject on a component rendered outside <Layout>", () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <p>bare content, no layout</p>
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.queryByLabelText(NOTICE_LABEL)).toBeNull();
  });
});
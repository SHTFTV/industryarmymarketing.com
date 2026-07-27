import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Mock sonner so toasts don't move focus.
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  }),
  Toaster: () => null,
}));

// Mock Layout / PageHeader / Seo to keep the test light.
vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/PageHeader", () => ({ default: () => null }));
vi.mock("@/components/Seo", () => ({ default: () => null }));

const fakeUser = { id: "user-1", email: "tester@example.com" };
const fakeHistory = [
  {
    id: "audit-1",
    url: "https://example.com",
    score: 92,
    status: 200,
    ttfb: 120,
    checks: [],
    meta: { title: "t", description: "d", canonical: "", wordCount: 100, h1s: [], ogImage: "", hasSchema: false },
    deep_dive: null,
    created_at: new Date().toISOString(),
  },
];

vi.mock("@/integrations/supabase/client", () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => Promise.resolve({ data: fakeHistory, error: null }),
  };
  return {
    supabase: {
      auth: {
        getSession: () => Promise.resolve({ data: { session: { user: fakeUser } } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => builder,
      functions: { invoke: vi.fn() },
    },
  };
});

import SeoAudit from "./SeoAudit";

describe("SeoAudit Share button focus restoration", () => {
  beforeEach(() => {
    cleanup();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("returns focus to the Share button after the Copied state auto-dismisses", async () => {
    render(
      <MemoryRouter initialEntries={["/seo-audit"]}>
        <Routes>
          <Route path="/seo-audit" element={<SeoAudit />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for history to load and the Share button to appear.
    const shareBtn = await waitFor(() => screen.getByRole("button", { name: /copy shareable link/i }));

    // Click to copy.
    await act(async () => {
      shareBtn.click();
      // flush clipboard promise
      await Promise.resolve();
      await Promise.resolve();
    });

    // Button now reflects the Copied state.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /link copied to clipboard/i })).toBeInTheDocument()
    );

    // Advance past the 2s auto-dismiss timer; rAF triggers refocus.
    await act(async () => {
      vi.advanceTimersByTime(2100);
      await Promise.resolve();
    });

    const restored = screen.getByRole("button", { name: /copy shareable link/i });
    expect(document.activeElement).toBe(restored);
  });
});
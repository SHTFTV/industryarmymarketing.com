import { createLovableConfig } from "lovable-agent-playwright-config/config";
import { devices } from "@playwright/test";

// When PLAYWRIGHT_BASE_URL (or BASE_URL) is set, run the E2E suite against
// that live origin — used by the post-deploy verification workflow to hit
// the published site instead of the sandbox dev server.
const LIVE_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || "";

// TEST_BROWSER lets CI run the same suite on multiple engines by pinning a
// single project per matrix leg (chromium | webkit | firefox). When unset,
// all three projects are exposed so `--project=<name>` still works locally.
const ONLY_BROWSER = process.env.TEST_BROWSER;

// Stable defaults every project inherits — pin device pixel ratio, locale,
// timezone, color scheme, and reduced motion so screenshots are byte-stable
// across CI runs and local dev.
const STABLE_USE = {
  deviceScaleFactor: 1,
  locale: "en-US",
  timezoneId: "America/Vancouver",
  colorScheme: "dark" as const,
  reducedMotion: "reduce" as const,
};

const ALL_PROJECTS = [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"], ...STABLE_USE },
  },
  {
    name: "webkit",
    use: { ...devices["Desktop Safari"], ...STABLE_USE },
  },
  {
    name: "firefox",
    use: { ...devices["Desktop Firefox"], ...STABLE_USE },
  },
];
const projects = ONLY_BROWSER
  ? ALL_PROJECTS.filter((p) => p.name === ONLY_BROWSER)
  : ALL_PROJECTS;

// Snapshot comparison defaults — permissive enough to absorb subpixel/AA
// differences between engines while still catching real UI regressions.
// `threshold` is per-pixel color tolerance; `maxDiffPixelRatio` is the
// fraction of the image allowed to differ overall.
const EXPECT_DEFAULTS = {
  toHaveScreenshot: {
    threshold: 0.25,
    maxDiffPixelRatio: 0.05,
    animations: "disabled" as const,
    caret: "hide" as const,
    scale: "css" as const,
  },
  toMatchSnapshot: {
    threshold: 0.25,
    maxDiffPixelRatio: 0.05,
  },
};

export default createLovableConfig(
  LIVE_BASE_URL
    ? {
        use: {
          baseURL: LIVE_BASE_URL,
          ...STABLE_USE,
        },
        // Disable the managed dev server — we are hitting a live origin.
        webServer: undefined,
        projects,
        expect: EXPECT_DEFAULTS,
      }
    : { use: { ...STABLE_USE }, projects, expect: EXPECT_DEFAULTS },
);

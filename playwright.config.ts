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
const ALL_PROJECTS = [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "webkit", use: { ...devices["Desktop Safari"] } },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
];
const projects = ONLY_BROWSER
  ? ALL_PROJECTS.filter((p) => p.name === ONLY_BROWSER)
  : ALL_PROJECTS;

export default createLovableConfig(
  LIVE_BASE_URL
    ? {
        use: {
          baseURL: LIVE_BASE_URL,
        },
        // Disable the managed dev server — we are hitting a live origin.
        webServer: undefined,
        projects,
      }
    : { projects },
);

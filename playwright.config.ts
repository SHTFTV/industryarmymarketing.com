import { createLovableConfig } from "lovable-agent-playwright-config/config";

// When PLAYWRIGHT_BASE_URL (or BASE_URL) is set, run the E2E suite against
// that live origin — used by the post-deploy verification workflow to hit
// the published site instead of the sandbox dev server.
const LIVE_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || "";

export default createLovableConfig(
  LIVE_BASE_URL
    ? {
        use: {
          baseURL: LIVE_BASE_URL,
        },
        // Disable the managed dev server — we are hitting a live origin.
        webServer: undefined,
      }
    : {},
);

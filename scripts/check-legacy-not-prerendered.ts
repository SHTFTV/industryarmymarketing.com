// Fails if react-snap generated any dist/ HTML for legacy redirect
// paths. Legacy routes must never appear as static files — they should
// only exist as in-app <Navigate> redirects and, on the deployed
// origin, as 3xx responses.
//
// Runs against `dist/` after `bun run build` (which invokes react-snap
// via the postbuild hook).

import { existsSync, statSync } from "fs";
import { resolve } from "path";
import { LEGACY_REDIRECTS } from "../src/components/LegacyRedirects";

const DIST = resolve("dist");

function legacyDistCandidates(from: string): string[] {
  // Trim trailing slash and wildcard suffix.
  const base = from.replace(/\/\*$/, "").replace(/\/$/, "");
  if (!base) return [];
  // react-snap emits either `<path>.html` or `<path>/index.html`.
  return [
    resolve(DIST, `.${base}.html`),
    resolve(DIST, `.${base}`, "index.html"),
  ];
}

const offenders: string[] = [];
for (const { from } of LEGACY_REDIRECTS) {
  for (const candidate of legacyDistCandidates(from)) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      offenders.push(candidate.replace(DIST, "dist"));
    }
  }
}

if (offenders.length > 0) {
  console.error(
    `check-legacy-not-prerendered: FAIL — react-snap emitted HTML for legacy redirect paths:`,
  );
  for (const o of offenders) console.error(`  ${o}`);
  process.exit(1);
}
console.log(
  `check-legacy-not-prerendered: PASS — no dist HTML for ${LEGACY_REDIRECTS.length} legacy paths`,
);
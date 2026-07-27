# Redirect chain baselines

`redirect-chain-baseline.json` records the **approved** expected hop
statuses and final URL for each legacy rule. When present, the
redirect-chain validator uses these values instead of the defaults
derived from `LEGACY_REDIRECTS` + `STATUS_EXPECTATIONS`.

## When to update

Regenerate the baseline only after you've verified the new redirect
outcome is intentional (e.g. an intentional CDN/hosting change).

```sh
# Refresh from a live production run:
bunx tsx scripts/redirect-chain-validator.ts \
  --base https://www.industryarmymarketing.com \
  --ua-matrix \
  --summary redirect-chain-summary.json \
  --update-baseline

# Or only for a single rule / prefix:
bunx tsx scripts/redirect-chain-validator.ts \
  --only /wp-admin \
  --update-baseline
```

`--update-baseline` writes any rule whose current run terminated cleanly
(non-empty hop chain, no fetch error) back into
`.redirect-baselines/redirect-chain-baseline.json`. It does **not**
overwrite rules that errored — those keep their previous baseline.

## Format

```json
{
  "generatedAt": "2026-07-21T08:17:00.000Z",
  "base": "https://www.industryarmymarketing.com",
  "rules": {
    "/contact-us": {
      "hops": [["301"]],
      "finalPath": "/contact",
      "approvedAt": "2026-07-21T08:17:00.000Z"
    }
  }
}
```

`hops` is per-hop allowed statuses (each inner array is one hop's
accepted status set). `finalPath` is stored as a path so the baseline
is portable across environments (staging vs production).

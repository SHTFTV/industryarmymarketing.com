// Tests for the redirect-chain baseline guards: schema-mismatch handling
// on --baseline load, and the drift-threshold gate exit-code /
// annotation payload contract.
//
// The schema-mismatch test spawns scripts/redirect-chain-validator.ts as
// a subprocess and points --baseline at a temp file whose schemaVersion
// is intentionally out-of-range. The validator loads the baseline at
// module init and exits(3) before any network fetch — no live HTTP
// needed. The drift-gate tests exercise the pure helper directly.

import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { writeFileSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { evaluateDriftGate, type BaselineDriftEntry } from "../../scripts/lib/drift-gate";

const VALIDATOR = "scripts/redirect-chain-validator.ts";

describe("redirect-chain-validator baseline schema guard", () => {
  it("exits 3 with a MIGRATION REQUIRED error when the baseline schemaVersion is unsupported", () => {
    const dir = mkdtempSync(join(tmpdir(), "baseline-schema-"));
    const badPath = join(dir, "bad-baseline.json");
    writeFileSync(
      badPath,
      JSON.stringify({
        schemaVersion: "999",
        generatedAt: new Date().toISOString(),
        base: "https://example.test",
        rules: {},
      }),
    );

    const res = spawnSync(
      "bunx",
      ["tsx", VALIDATOR, "--baseline", badPath, "--annotate", "--only", "/__nomatch__"],
      { encoding: "utf8" },
    );

    expect(res.status).toBe(3);
    const combined = `${res.stdout}\n${res.stderr}`;
    expect(combined).toMatch(/MIGRATION REQUIRED/);
    expect(combined).toMatch(/schemaVersion "999"/);
  });
});

describe("evaluateDriftGate", () => {
  const changedRule = (
    rule: string,
    finalPathChanged = false,
  ): BaselineDriftEntry => ({
    rule,
    kind: "changed",
    hopsChanged: true,
    finalPathChanged,
    old: { hops: [["301"]], finalPath: "/old" },
    next: { hops: [["301", "308"]], finalPath: finalPathChanged ? "/new" : "/old" },
  });

  it("returns exit 0 and empty message when within thresholds", () => {
    const r = evaluateDriftGate({
      diffs: [changedRule("/a"), changedRule("/b")],
      maxRules: 5,
      maxFinalPathChanges: 5,
    });
    expect(r.overRules).toBe(false);
    expect(r.overFinal).toBe(false);
    expect(r.exitCode).toBe(0);
    expect(r.message).toBe("");
  });

  it("flags overRules with exit 2 and emits per-rule warning annotations", () => {
    const r = evaluateDriftGate({
      diffs: [changedRule("/a"), changedRule("/b"), changedRule("/c")],
      maxRules: 1,
      maxFinalPathChanges: 5,
    });
    expect(r.overRules).toBe(true);
    expect(r.overFinal).toBe(false);
    expect(r.exitCode).toBe(2);
    expect(r.message).toContain("changed rules=3 (max 1)");
    expect(r.message).toContain("finalPath changes=0 (max 5)");
    expect(r.annotations).toHaveLength(3);
    for (const a of r.annotations) {
      expect(a.startsWith("::warning title=Redirect baseline changed::")).toBe(true);
      expect(a).toMatch(/hops \(none\)|hops 301/);
    }
  });

  it("flags overFinal with exit 2 when finalPath changes exceed the limit", () => {
    const r = evaluateDriftGate({
      diffs: [changedRule("/a", true), changedRule("/b", true)],
      maxRules: 10,
      maxFinalPathChanges: 1,
    });
    expect(r.overFinal).toBe(true);
    expect(r.overRules).toBe(false);
    expect(r.exitCode).toBe(2);
    expect(r.message).toContain("finalPath changes=2 (max 1)");
  });

  it("emits ::notice for added rules and ::warning for changed rules", () => {
    const r = evaluateDriftGate({
      diffs: [
        {
          rule: "/brand-new",
          kind: "added",
          hopsChanged: true,
          finalPathChanged: true,
          next: { hops: [["301"]], finalPath: "/dest" },
        },
        changedRule("/existing", true),
      ],
    });
    expect(r.exitCode).toBe(0);
    expect(r.annotations[0]).toMatch(/^::notice title=Redirect baseline added::baseline added: \/brand-new/);
    expect(r.annotations[1]).toMatch(/^::warning title=Redirect baseline changed::baseline changed: \/existing/);
    expect(r.annotations[1]).toContain("finalPath /old → /new");
  });

  it("counts added and modified separately", () => {
    const r = evaluateDriftGate({
      diffs: [
        { rule: "/x", kind: "added", hopsChanged: true, finalPathChanged: true, next: { hops: [["301"]], finalPath: "/x" } },
        changedRule("/y"),
        { rule: "/z", kind: "unchanged", hopsChanged: false, finalPathChanged: false, next: { hops: [["301"]], finalPath: "/z" } },
      ],
    });
    expect(r.changedCount).toBe(2);
    expect(r.addedCount).toBe(1);
    expect(r.modifiedCount).toBe(1);
  });
});

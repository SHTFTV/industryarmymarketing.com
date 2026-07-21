// Pure drift-threshold gating logic for the redirect-chain baseline
// updater. Extracted from scripts/redirect-chain-validator.ts so it can
// be unit-tested without spinning up a full HTTP validation run.
//
// See src/test/redirect-baseline-guard.test.ts for the accompanying
// tests that pin exit-code and annotation-payload behavior.

export type BaselineDriftKind = "added" | "changed" | "unchanged";
export interface BaselineDriftEntry {
  rule: string;
  kind: BaselineDriftKind;
  hopsChanged: boolean;
  finalPathChanged: boolean;
  old?: { hops?: string[][]; finalPath?: string };
  next: { hops: string[][]; finalPath: string };
}

export interface DriftGateInput {
  diffs: BaselineDriftEntry[];
  maxRules?: number;
  maxFinalPathChanges?: number;
}

export interface DriftGateResult {
  changedCount: number;
  addedCount: number;
  modifiedCount: number;
  finalPathChanges: number;
  overRules: boolean;
  overFinal: boolean;
  exitCode: 0 | 2;
  message: string;
  annotations: string[];
}

function fmtHops(h?: string[][]): string {
  if (!h || h.length === 0) return "(none)";
  return h.map((x) => x.join("/")).join(" → ");
}

/**
 * Evaluate whether baseline drift exceeds the configured thresholds and
 * produce a stable set of GitHub Actions annotation payloads. Pure —
 * no I/O, no process.exit — so tests can assert on the exact strings.
 */
export function evaluateDriftGate(input: DriftGateInput): DriftGateResult {
  const changed = input.diffs.filter((d) => d.kind !== "unchanged");
  const added = changed.filter((d) => d.kind === "added");
  const modified = changed.filter((d) => d.kind === "changed");
  const finalPathChanges = changed.filter((d) => d.finalPathChanged).length;

  const overRules =
    input.maxRules !== undefined && changed.length > input.maxRules;
  const overFinal =
    input.maxFinalPathChanges !== undefined &&
    finalPathChanges > input.maxFinalPathChanges;

  const annotations: string[] = [];
  for (const d of changed) {
    const parts: string[] = [];
    if (d.hopsChanged)
      parts.push(`hops ${fmtHops(d.old?.hops)} → ${fmtHops(d.next.hops)}`);
    if (d.finalPathChanged)
      parts.push(
        `finalPath ${d.old?.finalPath ?? "(none)"} → ${d.next.finalPath}`,
      );
    const level = d.kind === "added" ? "notice" : "warning";
    const title = `Redirect baseline ${d.kind}`;
    annotations.push(
      `::${level} title=${title}::baseline ${d.kind}: ${d.rule}` +
        (parts.length ? ` | ${parts.join(" | ")}` : ""),
    );
  }

  const message =
    overRules || overFinal
      ? `redirect-chain-validator: baseline drift exceeds threshold — ` +
        `changed rules=${changed.length}` +
        (input.maxRules !== undefined ? ` (max ${input.maxRules})` : "") +
        `, finalPath changes=${finalPathChanges}` +
        (input.maxFinalPathChanges !== undefined
          ? ` (max ${input.maxFinalPathChanges})`
          : "")
      : "";

  return {
    changedCount: changed.length,
    addedCount: added.length,
    modifiedCount: modified.length,
    finalPathChanges,
    overRules,
    overFinal,
    exitCode: overRules || overFinal ? 2 : 0,
    message,
    annotations,
  };
}

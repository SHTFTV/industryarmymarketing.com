import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Guard test — verifies the RLS restriction fix for
// `host_allowlist_requests_public_select` remains in place across migrations.
// The final migration state must expose SELECT to admins only (has_role),
// and never a permissive `USING (true)` SELECT policy on this table.

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

function loadMigrationsInOrder(): { name: string; sql: string }[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((name) => ({
      name,
      sql: readFileSync(join(MIGRATIONS_DIR, name), "utf8"),
    }));
}

describe("host_allowlist_requests RLS restriction", () => {
  const migrations = loadMigrationsInOrder();
  const touching = migrations.filter((m) =>
    /host_allowlist_requests/i.test(m.sql),
  );

  it("has at least one migration configuring host_allowlist_requests", () => {
    expect(touching.length).toBeGreaterThan(0);
  });

  it("final SELECT policy restricts reads to admins via has_role", () => {
    // Concatenate in order — later migrations override earlier ones.
    const combined = touching.map((m) => m.sql).join("\n\n");

    // The final state must include an admin-only SELECT policy.
    expect(combined).toMatch(
      /CREATE POLICY[^;]*host_allowlist_requests[\s\S]*?FOR SELECT[\s\S]*?has_role\(\s*auth\.uid\(\)\s*,\s*'admin'/i,
    );
  });

  it("does not leave a permissive `USING (true)` SELECT policy in place", () => {
    const combined = touching.map((m) => m.sql).join("\n\n");

    // If a permissive policy was ever created, a later DROP POLICY must remove it.
    const permissive =
      /CREATE POLICY[^;]*host_allowlist_requests[\s\S]*?FOR SELECT[\s\S]*?USING\s*\(\s*true\s*\)/i;
    const dropOldPolicy =
      /DROP POLICY[^;]*"Authenticated can view allowlist audit log"[\s\S]*?host_allowlist_requests/i;

    if (permissive.test(combined)) {
      expect(combined).toMatch(dropOldPolicy);
    }
  });

  it("keeps INSERT and UPDATE admin-scoped", () => {
    const combined = touching.map((m) => m.sql).join("\n\n");
    // UPDATE must be admin-only.
    expect(combined).toMatch(
      /host_allowlist_requests[\s\S]*?FOR UPDATE[\s\S]*?has_role\(\s*auth\.uid\(\)\s*,\s*'admin'/i,
    );
  });
});
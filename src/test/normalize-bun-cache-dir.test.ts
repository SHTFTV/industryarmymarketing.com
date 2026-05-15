import { describe, it, expect } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { normalizeBunCacheDir } = require("../../.github/workflows/lib/normalize-bun-cache-dir.cjs") as {
  normalizeBunCacheDir: (
    raw: string | undefined | null,
    opts?: { home?: string }
  ) => { ok: true; value: string } | { ok: false; error: string };
};

const HOME = "/home/runner";
const norm = (raw: string | undefined | null) => normalizeBunCacheDir(raw, { home: HOME });

describe("normalizeBunCacheDir", () => {
  describe("blank input → use default", () => {
    it.each([undefined, null, "", "   ", "\t", "\n  \t"])("treats %j as blank", (raw) => {
      expect(norm(raw as string)).toEqual({ ok: true, value: "" });
    });
  });

  describe("whitespace trimming", () => {
    it("trims leading/trailing whitespace", () => {
      expect(norm(" /var/cache/bun ")).toEqual({ ok: true, value: "/var/cache/bun" });
      expect(norm("\t/var/cache/bun\t")).toEqual({ ok: true, value: "/var/cache/bun" });
    });

    it("trims around ~ expansion", () => {
      expect(norm("  ~/.bun/cache  ")).toEqual({ ok: true, value: `${HOME}/.bun/cache` });
    });
  });

  describe("~ expansion", () => {
    it("expands lone ~", () => {
      expect(norm("~")).toEqual({ ok: true, value: HOME });
    });

    it("expands ~/path", () => {
      expect(norm("~/.bun/install/cache")).toEqual({
        ok: true,
        value: `${HOME}/.bun/install/cache`,
      });
    });

    it("does not expand ~user (treated as relative → fails)", () => {
      const r = norm("~bob/cache");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/absolute path/);
    });
  });

  describe("slash normalization", () => {
    it("collapses repeated slashes", () => {
      expect(norm("/var//cache///bun")).toEqual({ ok: true, value: "/var/cache/bun" });
    });

    it("strips trailing slashes", () => {
      expect(norm("/var/cache/bun/")).toEqual({ ok: true, value: "/var/cache/bun" });
      expect(norm("/var/cache/bun///")).toEqual({ ok: true, value: "/var/cache/bun" });
    });

    it("preserves lone /", () => {
      expect(norm("/")).toEqual({ ok: true, value: "/" });
      expect(norm("///")).toEqual({ ok: true, value: "/" });
    });
  });

  describe("relative paths → fail", () => {
    it.each(["cache", "./cache", "var/cache/bun", "relative/path"])(
      "rejects relative path %j",
      (raw) => {
        const r = norm(raw);
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.error).toMatch(/absolute path/);
      }
    );
  });

  describe("'..' path segments → fail", () => {
    it.each([
      "/var/cache/../bun",
      "/..",
      "/../etc/passwd",
      "/var/../../etc",
      "/a/b/../c",
    ])("rejects %j", (raw) => {
      const r = norm(raw);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/'\.\.'/);
    });

    it("allows '..' as a substring inside a segment", () => {
      expect(norm("/var/..cache/bun")).toEqual({ ok: true, value: "/var/..cache/bun" });
      expect(norm("/var/cache../bun")).toEqual({ ok: true, value: "/var/cache../bun" });
    });
  });

  describe("unsafe content → fail", () => {
    it("rejects null bytes", () => {
      const r = norm("/var/cache\0/bun");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/null byte/);
    });

    it("rejects embedded newlines", () => {
      const r = norm("/var/cache\n/bun");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/newlines/);
    });

    it("rejects embedded carriage returns", () => {
      const r = norm("/var/cache\r/bun");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/newlines/);
    });

    it("rejects paths > 4096 chars", () => {
      const r = norm("/" + "a".repeat(4096));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/4096/);
    });

    it("accepts paths at exactly 4096 chars", () => {
      const path = "/" + "a".repeat(4095);
      expect(path.length).toBe(4096);
      expect(norm(path)).toEqual({ ok: true, value: path });
    });
  });

  describe("happy path absolute inputs", () => {
    it.each([
      ["/var/cache/bun", "/var/cache/bun"],
      ["/tmp/.bun/install/cache", "/tmp/.bun/install/cache"],
      ["/a", "/a"],
    ])("normalizes %j → %j", (raw, expected) => {
      expect(norm(raw)).toEqual({ ok: true, value: expected });
    });
  });
});

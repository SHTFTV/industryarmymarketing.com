import { describe, it, expect, beforeEach, afterEach } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { normalizeRunAttempt } = require("../../.github/workflows/lib/normalize-run-attempt.js") as {
  normalizeRunAttempt: (raw?: string) => string;
};

describe("normalizeRunAttempt", () => {
  const original = process.env.GITHUB_RUN_ATTEMPT;
  beforeEach(() => {
    delete process.env.GITHUB_RUN_ATTEMPT;
  });
  afterEach(() => {
    if (original === undefined) delete process.env.GITHUB_RUN_ATTEMPT;
    else process.env.GITHUB_RUN_ATTEMPT = original;
  });

  it("returns a string type", () => {
    expect(typeof normalizeRunAttempt("3")).toBe("string");
  });

  it("passes through valid positive integers", () => {
    expect(normalizeRunAttempt("1")).toBe("1");
    expect(normalizeRunAttempt("2")).toBe("2");
    expect(normalizeRunAttempt("17")).toBe("17");
  });

  it("defaults to '1' when explicit arg is unset/empty", () => {
    expect(normalizeRunAttempt(undefined)).toBe("1");
    expect(normalizeRunAttempt("")).toBe("1");
  });

  it("defaults to '1' for zero and negative values", () => {
    expect(normalizeRunAttempt("0")).toBe("1");
    expect(normalizeRunAttempt("-1")).toBe("1");
    expect(normalizeRunAttempt("-42")).toBe("1");
  });

  it("defaults to '1' for non-numeric input", () => {
    expect(normalizeRunAttempt("abc")).toBe("1");
    expect(normalizeRunAttempt("NaN")).toBe("1");
    expect(normalizeRunAttempt("   ")).toBe("1");
  });

  it("parses leading-integer strings (parseInt semantics)", () => {
    expect(normalizeRunAttempt("3abc")).toBe("3");
    expect(normalizeRunAttempt(" 4 ")).toBe("4");
  });

  it("falls back to GITHUB_RUN_ATTEMPT env when no arg provided", () => {
    process.env.GITHUB_RUN_ATTEMPT = "5";
    expect(normalizeRunAttempt()).toBe("5");
  });

  it("defaults to '1' when env var is unset", () => {
    expect(normalizeRunAttempt()).toBe("1");
  });

  it("defaults to '1' when env var is empty or non-numeric", () => {
    process.env.GITHUB_RUN_ATTEMPT = "";
    expect(normalizeRunAttempt()).toBe("1");
    process.env.GITHUB_RUN_ATTEMPT = "garbage";
    expect(normalizeRunAttempt()).toBe("1");
    process.env.GITHUB_RUN_ATTEMPT = "0";
    expect(normalizeRunAttempt()).toBe("1");
  });
});
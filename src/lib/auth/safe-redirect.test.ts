import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("allows a simple internal path", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
  });

  it("preserves query strings and hashes on internal paths", () => {
    expect(safeRedirectPath("/guides?tab=all#top")).toBe("/guides?tab=all#top");
  });

  it("allows the root path", () => {
    expect(safeRedirectPath("/")).toBe("/");
  });

  it("falls back to / for null/undefined/empty", () => {
    expect(safeRedirectPath(null)).toBe("/");
    expect(safeRedirectPath(undefined)).toBe("/");
    expect(safeRedirectPath("")).toBe("/");
  });

  it("blocks userinfo tricks (@host becomes site.com@host once concatenated)", () => {
    expect(safeRedirectPath("@evil.com")).toBe("/");
  });

  it("blocks protocol-relative URLs", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/");
  });

  it("blocks backslash-escaped protocol-relative URLs", () => {
    expect(safeRedirectPath("/\\evil.com")).toBe("/");
  });

  it("blocks absolute URLs", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/");
    expect(safeRedirectPath("http://evil.com/path")).toBe("/");
  });

  it("blocks paths that do not start with a slash", () => {
    expect(safeRedirectPath("evil.com")).toBe("/");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/");
  });
});

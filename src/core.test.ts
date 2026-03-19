import { describe, expect, it } from "vitest";

import {
  expandHomePath,
  formatIsoDate,
  parseDateFromBasename,
  selectDailyMarkdownFilenames,
} from "./core";

describe("formatIsoDate", () => {
  it("formats Date as yyyy-mm-dd in local time", () => {
    const date = new Date(2026, 2, 18);
    expect(formatIsoDate(date)).toBe("2026-03-18");
  });
});

describe("expandHomePath", () => {
  it("expands ~ to user home directory", () => {
    expect(expandHomePath("~/.private-journal", "/Users/john")).toBe(
      "/Users/john/.private-journal",
    );
  });

  it("returns original value when path does not start with ~", () => {
    expect(expandHomePath("/tmp/private", "/Users/john")).toBe("/tmp/private");
  });
});

describe("parseDateFromBasename", () => {
  it("parses YYYY-MM-DD format", () => {
    expect(parseDateFromBasename("2026-03-18", "YYYY-MM-DD")).toBe("2026-03-18");
  });

  it("parses YYYY_MM_DD format", () => {
    expect(parseDateFromBasename("2026_03_18", "YYYY_MM_DD")).toBe("2026-03-18");
  });

  it("parses YYYYMMDD format", () => {
    expect(parseDateFromBasename("20260318", "YYYYMMDD")).toBe("2026-03-18");
  });

  it("returns null for non-matching basename", () => {
    expect(parseDateFromBasename("random-note", "YYYY-MM-DD")).toBeNull();
  });

  it("returns null for invalid date values", () => {
    expect(parseDateFromBasename("2026-13-45", "YYYY-MM-DD")).toBeNull();
  });
});

describe("selectDailyMarkdownFilenames", () => {
  it("keeps only markdown files with date prefix", () => {
    const filenames = [
      "2026-03-18.md",
      "2026-03-18-notes.md",
      "2026-03-18.txt",
      "2026-03-17.md",
      "readme.md",
    ];

    expect(selectDailyMarkdownFilenames(filenames, "2026-03-18")).toEqual([
      "2026-03-18-notes.md",
      "2026-03-18.md",
    ]);
  });
});

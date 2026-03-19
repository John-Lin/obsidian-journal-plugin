import { describe, expect, it } from "vitest";

import {
  buildImportedMarkdown,
  isExistingImportSection,
  IMPORT_HEADING_PREFIX,
} from "./importer";

describe("buildImportedMarkdown", () => {
  it("builds markdown with heading, tag, and single file content", () => {
    const result = buildImportedMarkdown("2026-03-18", [
      { filename: "2026-03-18.md", content: "some notes" },
    ]);

    expect(result).toBe(
      "## Imported from private journal: 2026-03-18 #journal\n\nsome notes",
    );
  });

  it("uses custom tag in heading", () => {
    const result = buildImportedMarkdown("2026-03-18", [
      { filename: "2026-03-18.md", content: "test" },
    ], "custom-tag");

    expect(result).toContain("## Imported from private journal: 2026-03-18 #custom-tag");
  });

  it("normalizes tag with leading hash", () => {
    const result = buildImportedMarkdown("2026-03-18", [
      { filename: "2026-03-18.md", content: "test" },
    ], "#journal");

    expect(result).toContain("## Imported from private journal: 2026-03-18 #journal");
  });

  it("strips frontmatter from file content", () => {
    const result = buildImportedMarkdown("2026-03-18", [
      {
        filename: "2026-03-18.md",
        content: "---\ntitle: \"test\"\ntimestamp: 1710000000000\n---\n\nhello world",
      },
    ]);

    expect(result).not.toContain("---");
    expect(result).toContain("hello world");
  });

  it("sorts entries by timestamp", () => {
    const result = buildImportedMarkdown("2026-03-18", [
      {
        filename: "2026-03-18/b.md",
        content: "---\ntimestamp: 1710000060000\n---\n\nsecond",
      },
      {
        filename: "2026-03-18/a.md",
        content: "---\ntimestamp: 1710000000000\n---\n\nfirst",
      },
    ]);

    expect(result.indexOf("first")).toBeLessThan(result.indexOf("second"));
  });

  it("uses time labels for entries with timestamps", () => {
    const result = buildImportedMarkdown("2026-03-18", [
      {
        filename: "2026-03-18/a.md",
        content: "---\ntimestamp: 1710000000000\n---\n\nhello",
      },
      {
        filename: "2026-03-18/b.md",
        content: "---\ntimestamp: 1710000060000\n---\n\nworld",
      },
    ]);

    expect(result).toMatch(/### \d{1,2}:\d{2}\s[AP]M/);
  });

  it("uses filename labels for entries without timestamps", () => {
    const result = buildImportedMarkdown("2026-03-18", [
      { filename: "2026-03-18-a.md", content: "hello" },
      { filename: "2026-03-18-b.md", content: "world" },
    ]);

    expect(result).toContain("### 2026-03-18-a.md");
    expect(result).toContain("### 2026-03-18-b.md");
  });

  it("omits subheading when there is only one file", () => {
    const result = buildImportedMarkdown("2026-03-18", [
      { filename: "2026-03-18.md", content: "only one" },
    ]);

    expect(result).not.toContain("### ");
  });

  it("includes subheadings when there are multiple files", () => {
    const result = buildImportedMarkdown("2026-03-18", [
      { filename: "2026-03-18-a.md", content: "alpha" },
      { filename: "2026-03-18-b.md", content: "beta" },
    ]);

    expect(result).toContain("### 2026-03-18-a.md");
    expect(result).toContain("### 2026-03-18-b.md");
  });
});

describe("isExistingImportSection", () => {
  it("matches heading with date and tag", () => {
    expect(isExistingImportSection(
      "## Imported from private journal: 2026-03-18 #journal",
      "2026-03-18",
    )).toBe(true);
  });

  it("matches heading with custom tag", () => {
    expect(isExistingImportSection(
      "## Imported from private journal: 2026-03-18 #custom-tag",
      "2026-03-18",
    )).toBe(true);
  });

  it("rejects different date", () => {
    expect(isExistingImportSection(
      "## Imported from private journal: 2026-03-17 #journal",
      "2026-03-18",
    )).toBe(false);
  });

  it("rejects unrelated heading", () => {
    expect(isExistingImportSection("## Some other heading", "2026-03-18")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isExistingImportSection("", "2026-03-18")).toBe(false);
  });
});

describe("IMPORT_HEADING_PREFIX", () => {
  it("is used consistently in buildImportedMarkdown output", () => {
    const result = buildImportedMarkdown("2026-03-18", [
      { filename: "2026-03-18.md", content: "test" },
    ]);

    expect(result.startsWith(`## ${IMPORT_HEADING_PREFIX} 2026-03-18`)).toBe(true);
  });
});

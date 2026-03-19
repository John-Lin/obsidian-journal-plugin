import { describe, expect, it } from "vitest";

import {
  buildImportedMarkdown,
  isExistingImportSection,
  IMPORT_HEADING,
} from "./importer";

describe("buildImportedMarkdown", () => {
  it("places tag on its own line below heading", () => {
    const result = buildImportedMarkdown([
      { filename: "2026-03-18.md", content: "some notes" },
    ]);

    expect(result).toBe(
      "# Imported from private journal\n#journal\nsome notes",
    );
  });

  it("uses custom tag below heading", () => {
    const result = buildImportedMarkdown([
      { filename: "2026-03-18.md", content: "test" },
    ], "custom-tag");

    expect(result).toContain("# Imported from private journal\n#custom-tag");
  });

  it("normalizes tag with leading hash", () => {
    const result = buildImportedMarkdown([
      { filename: "2026-03-18.md", content: "test" },
    ], "#journal");

    expect(result).toContain("# Imported from private journal\n#journal");
  });

  it("strips frontmatter from file content", () => {
    const result = buildImportedMarkdown([
      {
        filename: "2026-03-18.md",
        content: "---\ntitle: \"test\"\ntimestamp: 1710000000000\n---\n\nhello world",
      },
    ]);

    expect(result).not.toContain("---");
    expect(result).toContain("hello world");
  });

  it("sorts entries by timestamp", () => {
    const result = buildImportedMarkdown([
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
    const result = buildImportedMarkdown([
      {
        filename: "2026-03-18/a.md",
        content: "---\ntimestamp: 1710000000000\n---\n\nhello",
      },
      {
        filename: "2026-03-18/b.md",
        content: "---\ntimestamp: 1710000060000\n---\n\nworld",
      },
    ]);

    expect(result).toMatch(/## \d{1,2}:\d{2}\s[AP]M/);
  });

  it("uses filename labels for entries without timestamps", () => {
    const result = buildImportedMarkdown([
      { filename: "2026-03-18-a.md", content: "hello" },
      { filename: "2026-03-18-b.md", content: "world" },
    ]);

    expect(result).toContain("## 2026-03-18-a.md");
    expect(result).toContain("## 2026-03-18-b.md");
  });

  it("merges original headings into entry labels", () => {
    const result = buildImportedMarkdown([
      {
        filename: "2026-03-18/a.md",
        content: "---\ntimestamp: 1710000000000\n---\n\n## User Context\n\nfirst\n\n## Technical Insights\n\nsecond",
      },
    ]);

    expect(result).toMatch(/## \d{1,2}:\d{2}\s[AP]M — User Context/);
    expect(result).toMatch(/## \d{1,2}:\d{2}\s[AP]M — Technical Insights/);
    expect(result).toContain("first");
    expect(result).toContain("second");
  });

  it("omits subheading for single file without headings", () => {
    const result = buildImportedMarkdown([
      {
        filename: "2026-03-18/a.md",
        content: "---\ntimestamp: 1710000000000\n---\n\njust plain text",
      },
    ]);

    expect(result).not.toContain("## ");
    expect(result).toContain("just plain text");
  });

  it("shows time label for single file with headings", () => {
    const result = buildImportedMarkdown([
      {
        filename: "2026-03-18/a.md",
        content: "---\ntimestamp: 1710000000000\n---\n\n## Context\n\nsome text",
      },
    ]);

    expect(result).toMatch(/## \d{1,2}:\d{2}\s[AP]M — Context/);
    expect(result).toContain("some text");
  });

  it("uses filename labels for entries without timestamps and with headings", () => {
    const result = buildImportedMarkdown([
      { filename: "2026-03-18-a.md", content: "## Section\n\nalpha" },
      { filename: "2026-03-18-b.md", content: "beta" },
    ]);

    expect(result).toContain("## 2026-03-18-a.md — Section");
    expect(result).toContain("## 2026-03-18-b.md");
  });

  it("produces single section without subheading when one file has no headings", () => {
    const result = buildImportedMarkdown([
      { filename: "2026-03-18.md", content: "only one" },
    ]);

    expect(result).not.toMatch(/^## /m);
    expect(result).toContain("only one");
  });
});

describe("isExistingImportSection", () => {
  it("matches import heading", () => {
    expect(isExistingImportSection("# Imported from private journal")).toBe(true);
  });

  it("rejects unrelated heading", () => {
    expect(isExistingImportSection("# Some other heading")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isExistingImportSection("")).toBe(false);
  });
});

describe("IMPORT_HEADING", () => {
  it("is used consistently in buildImportedMarkdown output", () => {
    const result = buildImportedMarkdown([
      { filename: "2026-03-18.md", content: "test" },
    ]);

    expect(result.startsWith(IMPORT_HEADING)).toBe(true);
  });
});

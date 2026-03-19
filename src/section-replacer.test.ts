import { describe, expect, it } from "vitest";

import { replaceImportSection } from "./section-replacer";

describe("replaceImportSection", () => {
  it("appends section when no existing import found", () => {
    const existing = "# 2026-03-18\n\nSome notes";
    const importSection = "## Imported from private journal: 2026-03-18 #journal\n\nhello";

    const result = replaceImportSection(existing, importSection, "2026-03-18");

    expect(result).toBe(
      "# 2026-03-18\n\nSome notes\n\n## Imported from private journal: 2026-03-18 #journal\n\nhello",
    );
  });

  it("replaces existing import section", () => {
    const existing = [
      "# 2026-03-18",
      "",
      "Some notes",
      "",
      "## Imported from private journal: 2026-03-18 #journal",
      "",
      "old content",
    ].join("\n");
    const importSection = "## Imported from private journal: 2026-03-18 #journal\n\nnew content";

    const result = replaceImportSection(existing, importSection, "2026-03-18");

    expect(result).toContain("new content");
    expect(result).not.toContain("old content");
    expect(result).toContain("Some notes");
  });

  it("replaces section that spans until next same-level heading", () => {
    const existing = [
      "# 2026-03-18",
      "",
      "## Imported from private journal: 2026-03-18 #journal",
      "",
      "old content",
      "",
      "## Other section",
      "",
      "keep this",
    ].join("\n");
    const importSection = "## Imported from private journal: 2026-03-18 #journal\n\nnew content";

    const result = replaceImportSection(existing, importSection, "2026-03-18");

    expect(result).toContain("new content");
    expect(result).not.toContain("old content");
    expect(result).toContain("## Other section");
    expect(result).toContain("keep this");
  });

  it("preserves subsections within the replaced section", () => {
    const existing = [
      "## Imported from private journal: 2026-03-18 #journal",
      "",
      "### 3:08 PM",
      "",
      "old sub content",
    ].join("\n");
    const importSection = [
      "## Imported from private journal: 2026-03-18 #journal",
      "",
      "### 3:08 PM",
      "",
      "new sub content",
    ].join("\n");

    const result = replaceImportSection(existing, importSection, "2026-03-18");

    expect(result).toContain("new sub content");
    expect(result).not.toContain("old sub content");
  });

  it("appends to empty file", () => {
    const importSection = "## Imported from private journal: 2026-03-18 #journal\n\nhello";

    const result = replaceImportSection("", importSection, "2026-03-18");

    expect(result).toBe("## Imported from private journal: 2026-03-18 #journal\n\nhello");
  });
});

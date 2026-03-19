import { describe, expect, it } from "vitest";

import { replaceImportSection } from "./section-replacer";

describe("replaceImportSection", () => {
  it("appends section when no existing import found", () => {
    const existing = "Some notes";
    const importSection = "# Imported from private journal\n#journal\nhello";

    const result = replaceImportSection(existing, importSection);

    expect(result).toBe(
      "Some notes\n\n# Imported from private journal\n#journal\nhello",
    );
  });

  it("replaces existing import section", () => {
    const existing = [
      "Some notes",
      "",
      "# Imported from private journal",
      "#journal",
      "old content",
    ].join("\n");
    const importSection = "# Imported from private journal\n#journal\nnew content";

    const result = replaceImportSection(existing, importSection);

    expect(result).toContain("new content");
    expect(result).not.toContain("old content");
    expect(result).toContain("Some notes");
  });

  it("replaces section that spans until next same-level heading", () => {
    const existing = [
      "# Imported from private journal",
      "#journal",
      "old content",
      "",
      "# Other section",
      "",
      "keep this",
    ].join("\n");
    const importSection = "# Imported from private journal\n#journal\nnew content";

    const result = replaceImportSection(existing, importSection);

    expect(result).toContain("new content");
    expect(result).not.toContain("old content");
    expect(result).toContain("# Other section");
    expect(result).toContain("keep this");
  });

  it("preserves subsections within the replaced section", () => {
    const existing = [
      "# Imported from private journal",
      "#journal",
      "## 3:08 PM — Context",
      "old sub content",
    ].join("\n");
    const importSection = [
      "# Imported from private journal",
      "#journal",
      "## 3:08 PM — Context",
      "new sub content",
    ].join("\n");

    const result = replaceImportSection(existing, importSection);

    expect(result).toContain("new sub content");
    expect(result).not.toContain("old sub content");
  });

  it("appends to empty file", () => {
    const importSection = "# Imported from private journal\n#journal\nhello";

    const result = replaceImportSection("", importSection);

    expect(result).toBe("# Imported from private journal\n#journal\nhello");
  });
});

import { isExistingImportSection } from "./importer";

export function replaceImportSection(
  existingContent: string,
  importSection: string,
): string {
  if (existingContent === "") {
    return importSection;
  }

  const lines = existingContent.split("\n");
  const sectionStart = lines.findIndex((line) =>
    isExistingImportSection(line),
  );

  if (sectionStart === -1) {
    return `${existingContent}\n\n${importSection}`;
  }

  const sectionEnd = findSectionEnd(lines, sectionStart);
  const before = lines.slice(0, sectionStart);
  const after = lines.slice(sectionEnd);

  const parts = [
    before.join("\n"),
    importSection,
    after.join("\n"),
  ].filter((part) => part.length > 0);

  return parts.join("\n\n");
}

function findSectionEnd(lines: string[], sectionStart: number): number {
  for (let i = sectionStart + 1; i < lines.length; i++) {
    if (/^# [^#]/.test(lines[i])) {
      return i;
    }
  }

  return lines.length;
}

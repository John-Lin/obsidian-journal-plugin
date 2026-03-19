type ImportedFileContent = {
  filename: string;
  content: string;
};

type ParsedImportedFile = {
  filename: string;
  body: string;
  label: string;
  timestamp: number | null;
};

export const IMPORT_HEADING = "# Imported from private journal";

const DEFAULT_TAG = "journal";

export function buildImportedMarkdown(
  importedFiles: ImportedFileContent[],
  resourceTagPath?: string,
): string {
  const tag = normalizeTag(resourceTagPath);
  const header = `${IMPORT_HEADING}\n${tag}`;
  const parsedFiles = importedFiles
    .map((file) => parseImportedFile(file))
    .sort(compareImportedFiles);

  const entrySections = parsedFiles.flatMap((file) => buildEntrySections(file));

  if (entrySections.length === 1 && !entrySections[0].heading) {
    return `${header}\n${entrySections[0].body}`;
  }

  const sections = entrySections
    .map((section) => {
      const sectionHeading = section.heading
        ? `## ${section.label} — ${section.heading}`
        : `## ${section.label}`;
      return section.body
        ? `${sectionHeading}\n\n${section.body}`
        : sectionHeading;
    })
    .join("\n\n");

  return `${header}\n${sections}`;
}

export function isExistingImportSection(line: string): boolean {
  return line === IMPORT_HEADING;
}

function normalizeTag(resourceTagPath: string | undefined): string {
  const trimmed = resourceTagPath?.trim() ?? "";
  if (trimmed.length === 0) {
    return `#${DEFAULT_TAG}`;
  }

  const withoutHash = trimmed.replace(/^#+/, "").trim();
  if (withoutHash.length === 0) {
    return `#${DEFAULT_TAG}`;
  }

  return `#${withoutHash}`;
}

function compareImportedFiles(left: ParsedImportedFile, right: ParsedImportedFile): number {
  if (left.timestamp !== null && right.timestamp !== null) {
    return left.timestamp - right.timestamp;
  }

  if (left.timestamp !== null) {
    return -1;
  }

  if (right.timestamp !== null) {
    return 1;
  }

  return left.filename.localeCompare(right.filename);
}

function parseImportedFile(file: ImportedFileContent): ParsedImportedFile {
  const { metadata, body } = stripFrontmatter(file.content);
  const timestamp = parseTimestamp(metadata.timestamp);

  return {
    filename: file.filename,
    body,
    label: resolveEntryLabel(file.filename, timestamp),
    timestamp,
  };
}

function stripFrontmatter(content: string): {
  metadata: Record<string, string>;
  body: string;
} {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n)?/);
  if (!frontmatterMatch) {
    return {
      metadata: {},
      body: content.trimEnd(),
    };
  }

  const metadata: Record<string, string> = {};
  for (const line of frontmatterMatch[1].split(/\r?\n/)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    if (!key || !rawValue) {
      continue;
    }

    metadata[key] = stripSurroundingQuotes(rawValue);
  }

  const strippedBody = content
    .slice(frontmatterMatch[0].length)
    .replace(/^\s*\r?\n/, "")
    .trimEnd();

  return {
    metadata,
    body: strippedBody,
  };
}

function stripSurroundingQuotes(value: string): string {
  if (value.length < 2) {
    return value;
  }

  const firstChar = value[0];
  const lastChar = value[value.length - 1];
  if ((firstChar === '"' || firstChar === "'") && firstChar === lastChar) {
    return value.slice(1, -1);
  }

  return value;
}

function parseTimestamp(raw: string | undefined): number | null {
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

type EntrySection = {
  label: string;
  heading: string | null;
  body: string;
};

function buildEntrySections(file: ParsedImportedFile): EntrySection[] {
  const lines = file.body.split(/\r?\n/);
  type RawSection = { heading: string | null; lines: string[] };
  const sections: RawSection[] = [];
  let current: RawSection = { heading: null, lines: [] };

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      if (current.heading !== null || current.lines.length > 0) {
        sections.push(current);
      }
      current = { heading: headingMatch[1].trim(), lines: [] };
      continue;
    }
    current.lines.push(line);
  }

  if (current.heading !== null || current.lines.length > 0) {
    sections.push(current);
  }

  if (sections.length === 0) {
    return [{ label: file.label, heading: null, body: "" }];
  }

  return sections.map((section) => ({
    label: file.label,
    heading: section.heading,
    body: section.lines.join("\n").trim(),
  }));
}

function resolveEntryLabel(filename: string, timestamp: number | null): string {
  if (timestamp !== null) {
    return formatTimestampAsTime(timestamp);
  }

  return filename;
}

function formatTimestampAsTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

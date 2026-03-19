export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function expandHomePath(inputPath: string, homeDirectory: string): string {
  if (inputPath === "~") {
    return homeDirectory;
  }

  if (inputPath.startsWith("~/")) {
    return `${homeDirectory}/${inputPath.slice(2)}`;
  }

  return inputPath;
}

export function parseDateFromBasename(
  basename: string,
  dateFormat: string,
): string | null {
  const pattern = dateFormat
    .replace("YYYY", "(?<year>\\d{4})")
    .replace("MM", "(?<month>\\d{2})")
    .replace("DD", "(?<day>\\d{2})");

  const match = basename.match(new RegExp(`^${pattern}$`));
  if (!match?.groups) {
    return null;
  }

  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function selectDailyMarkdownFilenames(
  filenames: string[],
  isoDatePrefix: string,
): string[] {
  return filenames
    .filter((filename) => filename.startsWith(isoDatePrefix) && filename.endsWith(".md"))
    .sort((left, right) => left.localeCompare(right));
}

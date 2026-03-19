import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { selectDailyMarkdownFilenames } from "./core";

export type ImportedFileContent = {
  filename: string;
  content: string;
};

export async function loadDailyMarkdownFiles(
  directoryPath: string,
  isoDate: string,
): Promise<Array<ImportedFileContent>> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    throw new Error(`Invalid target date: ${isoDate}`);
  }

  const entries = await readdir(directoryPath);
  const matchedFilenames = selectDailyMarkdownFilenames(entries, isoDate);

  const importedFiles: Array<ImportedFileContent> = [];
  for (const filename of matchedFilenames) {
    const content = await readFile(join(directoryPath, filename), "utf-8");
    importedFiles.push({ filename, content });
  }

  const dayFolderFiles = await readDayFolderMarkdownFiles(directoryPath, isoDate);
  importedFiles.push(...dayFolderFiles);

  return importedFiles;
}

async function readDayFolderMarkdownFiles(
  directoryPath: string,
  isoDate: string,
): Promise<Array<ImportedFileContent>> {
  const dayFolderPath = join(directoryPath, isoDate);

  try {
    const stats = await stat(dayFolderPath);
    if (!stats.isDirectory()) {
      return [];
    }
  } catch {
    return [];
  }

  const entries = await readdir(dayFolderPath);
  const mdFiles = entries
    .filter((name) => name.endsWith(".md"))
    .sort((left, right) => left.localeCompare(right));

  const importedFiles: Array<ImportedFileContent> = [];
  for (const filename of mdFiles) {
    const content = await readFile(join(dayFolderPath, filename), "utf-8");
    importedFiles.push({ filename: `${isoDate}/${filename}`, content });
  }

  return importedFiles;
}

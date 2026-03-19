import { mkdtemp, mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { loadDailyMarkdownFiles } from "./file-loader";

describe("loadDailyMarkdownFiles", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), "journal-test-"));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true });
  });

  it("loads root-level markdown files matching the date", async () => {
    await writeFile(join(testDir, "2026-03-18.md"), "root entry");
    await writeFile(join(testDir, "2026-03-18-notes.md"), "notes entry");
    await writeFile(join(testDir, "2026-03-17.md"), "wrong date");
    await writeFile(join(testDir, "2026-03-18.txt"), "not markdown");

    const files = await loadDailyMarkdownFiles(testDir, "2026-03-18");

    expect(files.map((f) => f.filename)).toEqual([
      "2026-03-18-notes.md",
      "2026-03-18.md",
    ]);
    expect(files[0].content).toBe("notes entry");
    expect(files[1].content).toBe("root entry");
  });

  it("loads markdown files from date subdirectory", async () => {
    await mkdir(join(testDir, "2026-03-18"));
    await writeFile(join(testDir, "2026-03-18", "15-08-05.md"), "sub entry");

    const files = await loadDailyMarkdownFiles(testDir, "2026-03-18");

    expect(files).toEqual([
      { filename: "2026-03-18/15-08-05.md", content: "sub entry" },
    ]);
  });

  it("loads from both root and subdirectory", async () => {
    await writeFile(join(testDir, "2026-03-18.md"), "root");
    await mkdir(join(testDir, "2026-03-18"));
    await writeFile(join(testDir, "2026-03-18", "note.md"), "sub");

    const files = await loadDailyMarkdownFiles(testDir, "2026-03-18");

    expect(files.map((f) => f.filename)).toEqual([
      "2026-03-18.md",
      "2026-03-18/note.md",
    ]);
  });

  it("returns empty array when no files match", async () => {
    await writeFile(join(testDir, "2026-03-17.md"), "wrong date");

    const files = await loadDailyMarkdownFiles(testDir, "2026-03-18");

    expect(files).toEqual([]);
  });

  it("returns empty array when date subdirectory does not exist", async () => {
    const files = await loadDailyMarkdownFiles(testDir, "2026-03-18");

    expect(files).toEqual([]);
  });

  it("throws on invalid date format", async () => {
    await expect(loadDailyMarkdownFiles(testDir, "bad")).rejects.toThrow(
      "Invalid target date: bad",
    );
  });
});

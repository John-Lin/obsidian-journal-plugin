# Journal for Obsidian

This plugin adds a command that imports daily markdown notes from a local directory (default: `~/.private-journal`) into your current Obsidian daily note.

## Prerequisite

Before using this plugin, set up and run `private-journal-mcp` first:

- Repository: [John-Lin/private-journal-mcp](https://github.com/John-Lin/private-journal-mcp)
- Purpose: generates your local `.private-journal` data, which this plugin imports into Obsidian.

Without that prerequisite, there may be no `.private-journal` content to import.

## Features

- Command palette: `Import journal`
- Imports only the current daily note date (`YYYY-MM-DD`) from the configured directory
- Supports both `YYYY-MM-DD*.md` and `YYYY-MM-DD/*.md` file structures
- Converts entries into markdown sections with time labels when timestamps are available
- Re-importing replaces the existing import section with fresh content
- Respects Obsidian's daily notes date format setting

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build plugin output:

   ```bash
   npm run build
   ```

   This generates `dist/main.js`.

3. In Obsidian, enable community plugins, then use `Load unpacked plugin` and select this project folder.

## Plugin Settings

- `Journal directory`: path to the local journal directory. Supports `~` for home directory.
  - Default: `~/.private-journal`

## Usage

1. Open a daily note in Obsidian.
2. Open the command palette (`Cmd+P` / `Ctrl+P`).
3. Search for and run `Journal: Import journal`.
4. The plugin appends an `## Imported from private journal: YYYY-MM-DD` section to the daily note.
5. Running the command again on the same date replaces the previous import with fresh content.

Note: Import runs only on daily notes. On non-daily-note files it will show an error.

## File Match Rule

For journal date `2026-03-18`, the plugin imports files like:

- `2026-03-18.md`
- `2026-03-18-notes.md`
- `2026-03-18/00-40-25-554525.md`

Non-markdown files or other dates are ignored.

## Development

```bash
npm test
npm run build
```

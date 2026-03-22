# AI Journal for Obsidian

Import daily private journal markdown into your Obsidian daily notes from a local directory.

> **Disclosure:** This plugin is desktop-only. It reads markdown files from a directory outside your Obsidian vault (default: `~/.private-journal`) using Node.js filesystem APIs. No data is sent over the network.

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
- Adds a configurable tag (default: `#journal`)
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

3. Generate a minimal release package (recommended):

   ```bash
   npm run package:release
   ```

   This creates `release/` with only runtime files.

4. In Obsidian, enable community plugins, then load the plugin from the project folder.

## Install Without Marketplace

1. Open this repository's [Releases](https://github.com/John-Lin/obsidian-journal-plugin/releases) page on GitHub.
2. Download `main.js` and `manifest.json` from the latest release assets.
3. Create a folder at your vault's `.obsidian/plugins/ai-journal/` and place both files inside.
4. In Obsidian, go to `Settings` -> `Community plugins` and enable `AI Journal`.

To update, download the newest release assets, replace the old files, and reload the plugin.

## Plugin Settings

- `Journal directory`: path to the local journal directory. Supports `~` for home directory.
  - Default: `~/.private-journal`
- `Tag`: tag text for imported heading. Plugin auto-prefixes `#`.
  - Default: `journal`
  - Example: `journal` (becomes `#journal`)

## Usage

1. Open a daily note in Obsidian.
2. Open the command palette (`Cmd+P` / `Ctrl+P`).
3. Search for and run `Journal: Import journal`.
4. The plugin appends an `# Imported from private journal` section to the daily note.
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

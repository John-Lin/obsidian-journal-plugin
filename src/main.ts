import { Notice, Plugin, PluginSettingTab, App, Setting, TFile } from "obsidian";
import { homedir } from "os";

import { loadDailyMarkdownFiles } from "./file-loader";
import { buildImportedMarkdown } from "./importer";
import { replaceImportSection } from "./section-replacer";
import { expandHomePath, parseDateFromBasename } from "./core";

interface JournalPluginSettings {
  journalDirectory: string;
  tag: string;
}

const DEFAULT_SETTINGS: JournalPluginSettings = {
  journalDirectory: "~/.private-journal",
  tag: "journal",
};

export default class JournalPlugin extends Plugin {
  settings: JournalPluginSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addCommand({
      id: "import-journal",
      name: "Import journal",
      callback: () => this.importJournal(),
    });

    this.addSettingTab(new JournalSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async importJournal(): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice("No active file open");
      return;
    }

    const isoDate = this.extractDailyNoteDate(activeFile);
    if (!isoDate) {
      new Notice("Current file is not a daily note");
      return;
    }

    const directoryPath = expandHomePath(
      this.settings.journalDirectory,
      homedir(),
    );

    let importedFiles: Awaited<ReturnType<typeof loadDailyMarkdownFiles>>;
    try {
      importedFiles = await loadDailyMarkdownFiles(directoryPath, isoDate);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new Notice(`Unable to load journal files: ${message}`);
      return;
    }

    if (importedFiles.length === 0) {
      new Notice(`No markdown files found for ${isoDate}`);
      return;
    }

    const importSection = buildImportedMarkdown(isoDate, importedFiles, this.settings.tag);
    const existingContent = await this.app.vault.read(activeFile);
    const newContent = replaceImportSection(existingContent, importSection, isoDate);

    await this.app.vault.modify(activeFile, newContent);
    new Notice(`Imported ${importedFiles.length} file(s) for ${isoDate}`);
  }

  private extractDailyNoteDate(file: TFile): string | null {
    const dailyNotesConfig = this.getDailyNotesConfig();
    const dateFormat = dailyNotesConfig.format || "YYYY-MM-DD";
    return parseDateFromBasename(file.basename, dateFormat);
  }

  private getDailyNotesConfig(): { format?: string; folder?: string } {
    const internalPlugins = (this.app as unknown as Record<string, unknown>)
      .internalPlugins as { getPluginById?: (id: string) => { instance?: { options?: Record<string, string> } } } | undefined;

    if (!internalPlugins?.getPluginById) {
      return {};
    }

    const dailyNotes = internalPlugins.getPluginById("daily-notes");
    return dailyNotes?.instance?.options ?? {};
  }
}

class JournalSettingTab extends PluginSettingTab {
  plugin: JournalPlugin;

  constructor(app: App, plugin: JournalPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Journal directory")
      .setDesc("Path to the local journal directory (supports ~)")
      .addText((text) =>
        text
          .setPlaceholder("~/.private-journal")
          .setValue(this.plugin.settings.journalDirectory)
          .onChange(async (value) => {
            this.plugin.settings.journalDirectory = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Tag")
      .setDesc("Tag added to the import heading (auto-prefixed with #)")
      .addText((text) =>
        text
          .setPlaceholder("journal")
          .setValue(this.plugin.settings.tag)
          .onChange(async (value) => {
            this.plugin.settings.tag = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}

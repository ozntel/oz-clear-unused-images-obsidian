import OzanClearImages from './main';
import { PluginSettingTab, Setting, App } from 'obsidian';

export class OzanClearImagesSettingsTab extends PluginSettingTab {

    plugin: OzanClearImages;

    constructor(app: App, plugin: OzanClearImages) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {

        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Clear Images Settings" });

        new Setting(containerEl)
            .setName('Ribbon Icon')
            .setDesc('Turn on if you want Ribbon Icon for clearing the images.')
            .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.ribbonIcon)
                .onChange((value) => {
                    this.plugin.settings.ribbonIcon = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshIconRibbon();
                })
            )

        new Setting(containerEl)
            .setName('Deleted Image Destination')
            .setDesc('Select where you want images to be moved once they are deleted')
            .addDropdown((dropdown) => {
                dropdown.addOption('permanent', 'Delete Permanently');
                dropdown.addOption('.trash', 'Move to Obsidian Trash');
                dropdown.addOption('system-trash', 'Move to System Trash');
                dropdown.setValue(this.plugin.settings.deleteOption);
                dropdown.onChange((option) => {
                    this.plugin.settings.deleteOption = option;
                    this.plugin.saveSettings();
                })
            })

        new Setting(containerEl)
            .setName('Excluded Folders')
            .setDesc(`Provide the folder names (Case Sensitive) divided by comma (,) to be excluded from clearing. 
					i.e. For images under Personal/Files/Zodiac -> Zodiac should be used for exclusion`)
            .addText((text) => text
                .setValue(this.plugin.settings.excludedFolders)
                .onChange((value) => {
                    this.plugin.settings.excludedFolders = value;
                    this.plugin.saveSettings();
                })
            )
    }
}
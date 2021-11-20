import OzanClearImages from './main';
import { PluginSettingTab, Setting, App } from 'obsidian';

export interface OzanClearImagesSettings {
    deleteOption: string;
    logsModal: boolean;
    excludedFolders: string;
    ribbonIcon: boolean;
    excludeSubfolders: boolean;
}

export const DEFAULT_SETTINGS: OzanClearImagesSettings = {
    deleteOption: '.trash',
    logsModal: true,
    excludedFolders: '',
    ribbonIcon: false,
    excludeSubfolders: false,
};

export class OzanClearImagesSettingsTab extends PluginSettingTab {
    plugin: OzanClearImages;

    constructor(app: App, plugin: OzanClearImages) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Clear Images Settings' });

        new Setting(containerEl)
            .setName('Ribbon Icon')
            .setDesc('Turn on if you want Ribbon Icon for clearing the images.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.ribbonIcon).onChange((value) => {
                    this.plugin.settings.ribbonIcon = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshIconRibbon();
                })
            );

        new Setting(containerEl)
            .setName('Delete Logs')
            .setDesc(
                'Turn off if you dont want to view the delete logs Modal to pop up after deletion is completed. It wont appear if no image is deleted'
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.logsModal).onChange((value) => {
                    this.plugin.settings.logsModal = value;
                    this.plugin.saveSettings();
                })
            );

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
                });
            });

        new Setting(containerEl)
            .setName('Excluded Folder Full Paths')
            .setDesc(
                `Provide the FULL path of the folder names (Case Sensitive) divided by comma (,) to be excluded from clearing. 
					i.e. For images under Personal/Files/Zodiac -> Personal/Files/Zodiac should be used for exclusion`
            )
            .addTextArea((text) =>
                text.setValue(this.plugin.settings.excludedFolders).onChange((value) => {
                    this.plugin.settings.excludedFolders = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Exclude Subfolders')
            .setDesc('Turn on this option if you want to also exclude all subfolders of the folder paths provided above.')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.excludeSubfolders).onChange((value) => {
                    this.plugin.settings.excludeSubfolders = value;
                    this.plugin.saveSettings();
                })
            );

        const coffeeDiv = containerEl.createDiv('coffee');
        coffeeDiv.addClass('oz-coffee-div');
        const coffeeLink = coffeeDiv.createEl('a', { href: 'https://ko-fi.com/L3L356V6Q' });
        const coffeeImg = coffeeLink.createEl('img', {
            attr: {
                src: 'https://cdn.ko-fi.com/cdn/kofi2.png?v=3',
            },
        });
        coffeeImg.height = 45;
    }
}

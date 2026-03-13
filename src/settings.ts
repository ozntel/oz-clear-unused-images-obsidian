import OzanClearImages from './main';
import { PluginSettingTab, Setting, App } from 'obsidian';
import { i18n } from './i18n';

export interface OzanClearImagesSettings {
    deleteOption: string;
    logsModal: boolean;
    excludedFolders: string;
    ribbonIcon: boolean;
    excludeSubfolders: boolean;
    excludedFiles: string[];
}

export const DEFAULT_SETTINGS: OzanClearImagesSettings = {
    deleteOption: '.trash',
    logsModal: true,
    excludedFolders: '',
    ribbonIcon: false,
    excludeSubfolders: false,
    excludedFiles: [],
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
        containerEl.createEl('h2', { text: i18n.t('settings.title') });

        new Setting(containerEl)
            .setName(i18n.t('settings.ribbonIcon.name'))
            .setDesc(i18n.t('settings.ribbonIcon.desc'))
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.ribbonIcon).onChange((value) => {
                    this.plugin.settings.ribbonIcon = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshIconRibbon();
                })
            );

        new Setting(containerEl)
            .setName(i18n.t('settings.logsModal.name'))
            .setDesc(
                i18n.t('settings.logsModal.desc')
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.logsModal).onChange((value) => {
                    this.plugin.settings.logsModal = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(i18n.t('settings.deleteOption.name'))
            .setDesc(i18n.t('settings.deleteOption.desc'))
            .addDropdown((dropdown) => {
                dropdown.addOption('permanent', i18n.t('settings.deleteOption.permanent'));
                dropdown.addOption('.trash', i18n.t('settings.deleteOption.obsidian.trash'));
                dropdown.addOption('system-trash', i18n.t('settings.deleteOption.system.trash'));
                dropdown.setValue(this.plugin.settings.deleteOption);
                dropdown.onChange((option) => {
                    this.plugin.settings.deleteOption = option;
                    this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName(i18n.t('settings.excludedFolders.name'))
            .setDesc(
                i18n.t('settings.excludedFolders.desc')
            )
            .addTextArea((text) =>
                text.setValue(this.plugin.settings.excludedFolders).onChange((value) => {
                    this.plugin.settings.excludedFolders = value;
                    this.plugin.saveSettings();
                })
            );
        
        new Setting(containerEl)
            .setName(i18n.t('settings.excludedFiles.name'))
            .setDesc(i18n.t('settings.excludedFiles.desc'))
            .addTextArea((text) =>
                text.setValue(this.plugin.settings.excludedFiles.join(',')).onChange((value) => {
                    this.plugin.settings.excludedFiles = value.split(',');
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(i18n.t('settings.excludeSubfolders.name'))
            .setDesc(i18n.t('settings.excludeSubfolders.desc'))
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

import OzanClearImages from './main';
import { PluginSettingTab, Setting, App } from 'obsidian';

export interface OzanClearImagesSettings {
    deleteOption: string;
    logsModal: boolean;
    excludedFolders: string;
    ribbonIcon: boolean;
    excludeSubfolders: boolean;
    language: string; // 新增语言选项
}

export const DEFAULT_SETTINGS: OzanClearImagesSettings = {
    deleteOption: '.trash',
    logsModal: true,
    excludedFolders: '',
    ribbonIcon: false,
    excludeSubfolders: false,
    language: 'en', // 默认英文
};

// 语言包类型
type Locale = {
    title: string;
    ribbonIcon: string;
    ribbonIconDesc: string;
    deleteLogs: string;
    deleteLogsDesc: string;
    deleteDestination: string;
    deleteDestinationDesc: string;
    deleteOptions: Record<string, string>;
    excludedFolders: string;
    excludedFoldersDesc: string;
    excludeSubfolders: string;
    excludeSubfoldersDesc: string;
    coffeeText: string;
};

// 英文语言包
const locale_en: Locale = {
    title: 'Clear Images Settings',
    ribbonIcon: 'Ribbon Icon',
    ribbonIconDesc: 'Turn on if you want Ribbon Icon for clearing the images.',
    deleteLogs: 'Delete Logs',
    deleteLogsDesc: 'Turn off if you dont want to view the delete logs Modal...',
    deleteDestination: 'Deleted Image Destination',
    deleteDestinationDesc: 'Select where you want images to be moved...',
    deleteOptions: {
        permanent: 'Delete Permanently',
        '.trash': 'Move to Obsidian Trash',
        'system-trash': 'Move to System Trash',
    },
    excludedFolders: 'Excluded Folder Full Paths',
    excludedFoldersDesc: 'Provide the FULL path of the folder names...',
    excludeSubfolders: 'Exclude Subfolders',
    excludeSubfoldersDesc: 'Turn on this option if you want to also exclude...',
    coffeeText: 'If you love this plugin, consider buying me a coffee ☕',
};

// 中文语言包
const locale_zh: Locale = {
    title: '清除图片设置',
    ribbonIcon: '功能区图标',
    ribbonIconDesc: '启用后将在侧边栏显示清除图片的功能区图标',
    deleteLogs: '删除日志',
    deleteLogsDesc: '关闭后不再显示删除完成后的日志弹窗...',
    deleteDestination: '删除位置',
    deleteDestinationDesc: '选择被删除图片的存放位置',
    deleteOptions: {
        permanent: '永久删除',
        '.trash': '移动到Obsidian回收站',
        'system-trash': '移动到系统回收站',
    },
    excludedFolders: '排除文件夹路径',
    excludedFoldersDesc: '填写需要排除的文件夹完整路径...',
    excludeSubfolders: '排除子文件夹',
    excludeSubfoldersDesc: '启用后，上述路径中的所有子文件夹也会被排除',
    coffeeText: '如果喜欢这个插件，欢迎请作者喝杯咖啡 ☕',
};

export class OzanClearImagesSettingsTab extends PluginSettingTab {
    plugin: OzanClearImages;

    constructor(app: App, plugin: OzanClearImages) {
        super(app, plugin);
        this.plugin = plugin;
    }

    getLocale(): Locale {
        return this.plugin.settings.language === 'zh' ? locale_zh : locale_en;
    }
    display(): void {
        let { containerEl } = this;
        const locale = this.getLocale();
        containerEl.empty();
        containerEl.createEl('h2', { text: locale.title });
        // 新增语言选择器
        new Setting(containerEl)
            .setName('Language / 语言')
            .setDesc('Select interface language / 选择界面语言')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('en', 'English')
                    .addOption('zh', '中文')
                    .setValue(this.plugin.settings.language)
                    .onChange(async (value) => {
                        this.plugin.settings.language = value;
                        await this.plugin.saveSettings();
                        this.display(); // 重新渲染界面
                    })
            );

        new Setting(containerEl)
            .setName(locale.ribbonIcon)
            .setDesc(locale.ribbonIconDesc)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.ribbonIcon).onChange((value) => {
                    this.plugin.settings.ribbonIcon = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshIconRibbon();
                })
            );

        new Setting(containerEl)
            .setName(locale.deleteLogs)
            .setDesc(locale.deleteLogsDesc)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.logsModal).onChange((value) => {
                    this.plugin.settings.logsModal = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(locale.deleteDestination)
            .setDesc(locale.deleteDestinationDesc)
            .addDropdown((dropdown) => {
                Object.entries(locale.deleteOptions).forEach(([key, value]) => {
                    dropdown.addOption(key, value);
                });
                dropdown.setValue(this.plugin.settings.deleteOption);
                dropdown.onChange((option) => {
                    this.plugin.settings.deleteOption = option;
                    this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName(locale.excludedFolders)
            .setDesc(locale.excludedFoldersDesc)
            .addTextArea((text) =>
                text.setValue(this.plugin.settings.excludedFolders).onChange((value) => {
                    this.plugin.settings.excludedFolders = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName(locale.excludeSubfolders)
            .setDesc(locale.excludeSubfoldersDesc)
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.excludeSubfolders).onChange((value) => {
                    this.plugin.settings.excludeSubfolders = value;
                    this.plugin.saveSettings();
                })
            );

        const coffeeDiv = containerEl.createDiv('coffee');
        coffeeDiv.addClass('oz-coffee-div');
        const coffeeLink = coffeeDiv.createEl('a', {
            href: 'https://ko-fi.com/L3L356V6Q',
            text: locale.coffeeText,
        });
        const coffeeImg = coffeeLink.createEl('img', {
            attr: {
                src: 'https://cdn.ko-fi.com/cdn/kofi2.png?v=3',
            },
        });
        coffeeImg.height = 45;
    }
}

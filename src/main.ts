import { Plugin, TFile, Notice } from 'obsidian';
import { OzanClearImagesSettingsTab } from './settings';
import { OzanClearImagesSettings, DEFAULT_SETTINGS } from './settings';
import { LogsModal, SelectiveDeleteModal } from './modals';
import * as Util from './util';
import { i18n } from './i18n';

export default class OzanClearImages extends Plugin {
    settings: OzanClearImagesSettings;
    ribbonIconEl: HTMLElement | undefined = undefined;

    async onload() {
        console.log('清理未使用的图片插件已加载...');
        this.addSettingTab(new OzanClearImagesSettingsTab(this.app, this));
        await this.loadSettings();
        this.addCommand({
            id: 'clear-images-obsidian',
            name: i18n.t('command.clear.images'),
            callback: () => this.clearUnusedAttachments('image'),
        });
        this.addCommand({
            id: 'clear-unused-attachments',
            name: i18n.t('command.clear.attachments'),
            callback: () => this.clearUnusedAttachments('all'),
        });
        this.refreshIconRibbon();
    }

    onunload() {
        console.log('清理未使用的图片插件已卸载...');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    refreshIconRibbon = () => {
        this.ribbonIconEl?.remove();
        if (this.settings.ribbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon('image-file', i18n.t('command.clear.images'), (event): void => {
                this.clearUnusedAttachments('image');
            });
        }
    };

    // Compare Used Images with all images and return unused ones
    clearUnusedAttachments = async (type: 'all' | 'image') => {
        var unusedAttachments: TFile[] = await Util.getUnusedAttachments(this.app, type);
        
        // Filter out files that are in excluded folders
        let filteredUnusedAttachments = unusedAttachments.filter(file => {
            return !Util.fileIsInExcludedFolder(file, this);
        });
        
        // Also filter out files that are in excludedFiles list
        filteredUnusedAttachments = filteredUnusedAttachments.filter(file => {
            return !this.settings.excludedFiles.includes(file.path);
        });
        
        var len = filteredUnusedAttachments.length;
        if (len > 0) {
            // Show the selective delete modal instead of immediately deleting
            const modal = new SelectiveDeleteModal(filteredUnusedAttachments, this.app);
            modal.open();
        } else {
            new Notice(i18n.t(type === 'image' ? 'notice.all.images.used' : 'notice.all.attachments.used'));
        }
    };
}

import { Plugin, TFile, Notice } from 'obsidian';
import { OzanClearImagesSettingsTab } from './settings';
import { OzanClearImagesSettings, DEFAULT_SETTINGS } from './settings';
import { ImageUtils, DeleteUtils } from './utils';

export default class OzanClearImages extends Plugin {
	settings: OzanClearImagesSettings;
	ribbonIconEl: HTMLElement | undefined = undefined;

	async onload() {
		console.log('Clear Unused Images plugin loaded...');
		this.addSettingTab(new OzanClearImagesSettingsTab(this.app, this));
		await this.loadSettings();
		this.addCommand({
			id: 'clear-images-obsidian',
			name: 'Clear Unused Images in Vault',
			callback: () => this.clearUnusedImages(),
		});
		this.refreshIconRibbon();
	}

	onunload() {
		console.log('Clear Unused Images plugin unloaded...');
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
			this.ribbonIconEl = this.addRibbonIcon('image-file', 'Clear Unused Images', (event): void => {
				this.clearUnusedImages();
			});
		}
	};

	// Compare Used Images with all images and return unused ones
	clearUnusedImages = async () => {
		var unusedImages: TFile[] = ImageUtils.getUnusedImages(this.app);
		var len = unusedImages.length;
		if (len > 0) {
			console.log('[+] Clearing started.');
			DeleteUtils.deleteFilesInTheList(unusedImages, this, this.app).then((nr) => {
				new Notice(nr + ' image(s) in total deleted.');
				console.log('[+] Clearing completed.');
			});
		} else {
			new Notice('All images are used. Nothing was deleted.');
		}
	};
}

import { Plugin, TFile, Notice, PluginSettingTab, Setting, App } from 'obsidian';

interface OzanClearImagesSettings {
	autoClearInterval: number;
	autoClearOnBoot: boolean;
}

const DEFAULT_SETTINGS: OzanClearImagesSettings = {
	autoClearInterval: 0,
	autoClearOnBoot: false,
}

export default class OzanClearImages extends Plugin {

	settings: OzanClearImagesSettings;
	timeoutID: number;

	async onload() {
		console.log("Loading oz-clear-unused-images plugin")
		this.addSettingTab(new OzanClearImagesSettingsTab(this.app, this));
		await this.loadSettings();
		this.addCommand({
			id: 'clear-images-obsidian',
			name: 'Clear Unused Images in Vault',
			callback: () => this.clearUnusedImages()
		});
		this.app.workspace.on('layout-ready', () => {
			if (this.settings.autoClearOnBoot) {
				setTimeout(() => this.clearUnusedImages(), 3000)
			}
		})
	}

	onunload() {
		console.log('Unloading oz-clear-unused-images plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	imageRegex = /.*(jpe?g|png|gif|svg|bmp)/;
	imageExtensions: Set<string> = new Set(['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp']);

	// Compare Used Images with all images and return unused ones
	clearUnusedImages = async () => {
		var all_images_in_vault: TFile[] = this.getAllImagesInVault();
		var unused_images: TFile[] = [];
		var used_images_set: Set<string>;

		// Get Used Images in All Markdown Files
		used_images_set = this.getImagePathSetForVault();

		// Compare All Images vs Used Images
		all_images_in_vault.forEach(img => {
			if (!used_images_set.has(img.path)) unused_images.push(img)
		});

		var len = unused_images.length;

		if (len > 0) {
			console.log('[+] Deleting ' + len + ' images.');
			await this.deleteFilesInTheList(unused_images);
			new Notice(len + ' image(s) in total deleted.');
			console.log('[+] Delete completed.');
		} else {
			new Notice('All images are used. Nothing was deleted.');
		}
	}

	// Clear Images From the Provided List
	deleteFilesInTheList = async (fileList: TFile[]) => {
		for (let file of fileList) {
			await this.app.vault.delete(file);
			console.log('Deleted: ' + file.path);
		}
	}

	// Getting all available images saved in vault
	getAllImagesInVault = (): TFile[] => {
		let allFiles: TFile[] = this.app.vault.getFiles();
		let images: TFile[] = [];
		for (let i = 0; i < allFiles.length; i++) {
			if (this.imageExtensions.has(allFiles[i].extension)) {
				images.push(allFiles[i]);
			}
		}
		return images;
	}

	// New Method for Getting All Used Images
	getImagePathSetForVault = (): Set<string> => {
		var images_set: Set<string> = new Set();
		var resolvedLinks = this.app.metadataCache.resolvedLinks;
		if (resolvedLinks) {
			for (const [md_file, links] of Object.entries(resolvedLinks)) {
				for (const [file_path, nr] of Object.entries(resolvedLinks[md_file])) {
					var image_match = file_path.match(this.imageRegex);
					if (image_match) images_set.add(image_match[0]);
				}
			}
		}
		return images_set
	}

	// Auto Clear Images
	startAutoClean(minutes?: number) {
		this.timeoutID = window.setTimeout(() => {
			this.clearUnusedImages();
			this.startAutoClean();
		}, (minutes ?? this.settings.autoClearInterval) * 60000)
	}

	// Clear Timeout
	clearAutoClean(): boolean {
		if (this.timeoutID) {
			window.clearTimeout(this.timeoutID);
			return true;
		}
		return false;
	}

}

class OzanClearImagesSettingsTab extends PluginSettingTab {

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
			.setName('Clear image interval (minutes)')
			.setDesc('Check and clear the unused images every X monutes. To disable auto clear, give zero (default)')
			.addText((text) => text
				.setValue(String(this.plugin.settings.autoClearInterval))
				.onChange((value) => {
					if (!isNaN(Number(value))) {
						this.plugin.settings.autoClearInterval = Number(value);
						this.plugin.saveSettings();
						if (this.plugin.settings.autoClearInterval > 0) {
							this.plugin.clearAutoClean();
							this.plugin.startAutoClean(this.plugin.settings.autoClearInterval);
							new Notice(`Auto clear enabled! Every ${this.plugin.settings.autoClearInterval} minutes`)
						} else if (this.plugin.settings.autoClearInterval <= 0) {
							this.plugin.clearAutoClean() && new Notice('Auto clear disabled')
						}
					} else {
						new Notice("Please specify a valid number.")
					}
				})
			)

		new Setting(containerEl)
			.setName("Clear Images on startup")
			.setDesc("Automatically clear images when Obsidian starts")
			.addToggle((toggle) => toggle
				.setValue(this.plugin.settings.autoClearOnBoot)
				.onChange((value) => {
					this.plugin.settings.autoClearOnBoot = value;
					this.plugin.saveSettings();
				})
			);
	}
}
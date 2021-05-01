import { Plugin } from 'obsidian';
import { clearUnusedImages } from './utils';

export default class OzanClearImages extends Plugin {

	onload() {
		console.log("Loading oz-clear-unused-images plugin")
		this.addCommand({
			id: 'clear-images-obsidian',
			name: 'Clear Unused Images in Vault',
			callback: () => clearUnusedImages(this.app)
		});
	}

	onunload() {
		console.log('Unloading oz-clear-unused-images plugin');
	}
}

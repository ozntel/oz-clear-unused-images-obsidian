import { Plugin, TFile, Notice } from 'obsidian';

export default class OzanClearImages extends Plugin {

	onload() {
		console.log("Loading oz-clear-unused-images plugin")
		this.addCommand({
			id: 'clear-images-obsidian',
			name: 'Clear Unused Images in Vault',
			callback: () => this.clearUnusedImages()
		});
	}

	onunload() {
		console.log('Unloading oz-clear-unused-images plugin');
	}

	imageRegex = /.*(jpe?g|png|gif|svg|bmp)/;
	imageExtensions: Set<string> = new Set(['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp']);

	// Compare Used Images with all images and return unused ones
	clearUnusedImages = async () => {
		var all_images_in_vault: TFile[] = this.getAllImagesInVault();
		var unused_images : TFile[] = [];
		var used_images_set: Set<string>;

		// Get Used Images in All Markdown Files
		used_images_set = this.getImagePathSetForVault();

		// Compare All Images vs Used Images
		all_images_in_vault.forEach( img => {
			if(!used_images_set.has(img.path)) unused_images.push(img)
		});

		var len = unused_images.length;
		
		if(len > 0){
			console.log('[+] Deleting ' + len + ' images.');
			this.deleteFilesInTheList(unused_images);
			new Notice(len + ' image(s) in total deleted.');
			console.log('[+] Delete completed.');
		}else{
			new Notice('All images are used. Nothing was deleted.');
		}
	}

	// Clear Images From the Provided List
	deleteFilesInTheList = (fileList: TFile[]) => {
		fileList.forEach( async (file) => {
			await this.app.vault.delete(file);
			console.log('Deleted: ' + file.path);
		})
	}

	// Getting all available images saved in vault
	getAllImagesInVault = (): TFile[] => {
		let allFiles : TFile[] = this.app.vault.getFiles();
		let images : TFile[] = [];
		for(let i=0; i < allFiles.length; i++){
			if(this.imageExtensions.has(allFiles[i].extension)){
				images.push(allFiles[i]);
			}
		}
		return images;
	}

	// New Method for Getting All Used Images
	getImagePathSetForVault = (): Set<string> => {
		var images_set: Set<string> = new Set();
		var resolvedLinks = this.app.metadataCache.resolvedLinks;
		if(resolvedLinks){
			for(const [md_file, links] of Object.entries(resolvedLinks)){
				for(const [file_path, nr] of Object.entries(resolvedLinks[md_file])){
					var image_match = file_path.match(this.imageRegex);
					if(image_match) images_set.add(image_match[0]);
				}
			}
		}
		return images_set
	}

}


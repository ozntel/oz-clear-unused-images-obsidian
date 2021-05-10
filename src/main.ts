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

	// Compare Used Images with all images and return unused ones
	clearUnusedImages = async () => {
		var all_images_in_vault: TFile[] = this.getAllImagesInVault();
		var unused_images : TFile[] = [];
		var markdown_files_in_vault = this.app.vault.getMarkdownFiles();
		var used_images_set: Set<string> = new Set();
console.log("workss")
		// Get Used Images in All Markdown Files
		await Promise.all(
			markdown_files_in_vault.map( async file => {
				var new_images = await this.getImageFilesFromMarkdown(file);
				new_images.forEach( img => used_images_set.add(img.path) );
			})
		)
		
		// Compare All Images vs Used Images
		all_images_in_vault.forEach( img => {
			if(!this.imageInTheFileList(img, used_images_set)) unused_images.push(img)
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

	// Check if image in the list
	imageInTheFileList = (image: TFile, set: Set<string>) => {
		return set.has(image.path)
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
			if(allFiles[i].path.match(this.imageRegex)){
				images.push(allFiles[i]);
			}
		}
		return images;
	}

	// Alternative Getting Images from the Markdown File
	getImageFilesFromMarkdown = async (file: TFile) => {
		var images: TFile[] = [];
		var image: TFile;
		var resolvedLinks = this.app.metadataCache.resolvedLinks[file.path];
		
		if(resolvedLinks){
			for(const [key, value] of Object.entries(resolvedLinks)){
				var image_match = key.match(this.imageRegex);
				if(image_match){
					image = this.app.metadataCache.getFirstLinkpathDest(decodeURIComponent(image_match[0]), file.path);
					if(image != null) images.push(image);
				}
			}
		}
		
		return await Promise.all(images);
	}

}


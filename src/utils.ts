import { App, TFile } from 'obsidian';
import OzanClearImages from './main';

export class ImageUtils {
	static imageRegex = /.*(jpe?g|png|gif|svg|bmp)/;
	static imageExtensions: Set<string> = new Set(['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp']);

	// Create the List of Unused Images
	static getUnusedImages = (app: App) => {
		var allImagesInVault: TFile[] = ImageUtils.getAllImagesInVault(app);
		var unusedImages: TFile[] = [];
		var usedImagesSet: Set<string>;

		// Get Used Images in All Markdown Files
		usedImagesSet = ImageUtils.getImagePathSetForVault(app);

		// Compare All Images vs Used Images
		allImagesInVault.forEach((img) => {
			if (!usedImagesSet.has(img.path)) unusedImages.push(img);
		});

		return unusedImages;
	};

	// Getting all available images saved in vault
	static getAllImagesInVault = (app: App): TFile[] => {
		let allFiles: TFile[] = app.vault.getFiles();
		let images: TFile[] = [];
		for (let i = 0; i < allFiles.length; i++) {
			if (ImageUtils.imageExtensions.has(allFiles[i].extension)) {
				images.push(allFiles[i]);
			}
		}
		return images;
	};

	// New Method for Getting All Used Images
	static getImagePathSetForVault = (app: App): Set<string> => {
		var imagesSet: Set<string> = new Set();
		var resolvedLinks = app.metadataCache.resolvedLinks;
		if (resolvedLinks) {
			for (const [mdFile, links] of Object.entries(resolvedLinks)) {
				for (const [filePath, nr] of Object.entries(resolvedLinks[mdFile])) {
					var imageMatch = filePath.match(ImageUtils.imageRegex);
					if (imageMatch) imagesSet.add(imageMatch[0]);
				}
			}
		}
		// Check Frontmatters if there is any image link
		let mdFiles = app.vault.getMarkdownFiles();
		mdFiles.forEach((mdFile) => {
			let fileCache = app.metadataCache.getFileCache(mdFile);
			if (fileCache.frontmatter) {
				let frontmatter = fileCache.frontmatter;
				for (let k of Object.keys(frontmatter)) {
					if (typeof frontmatter[k] === 'string' && ImageUtils.pathIsAnImage(frontmatter[k])) {
						imagesSet.add(frontmatter[k]);
					}
				}
			}
		});
		return imagesSet;
	};

	static pathIsAnImage = (path: string) => {
		var match = path.match(ImageUtils.imageRegex);
		return match ? true : false;
	};
}

export class DeleteUtils {
	// Clear Images From the Provided List
	static deleteFilesInTheList = async (fileList: TFile[], plugin: OzanClearImages, app: App): Promise<number> => {
		var deleteOption = plugin.settings.deleteOption;
		var deletedImages = 0;
		for (let file of fileList) {
			if (DeleteUtils.fileIsInExcludedFolder(file, plugin)) {
				console.log('File not referenced but excluded: ' + file.path);
			} else {
				if (deleteOption === '.trash') {
					await app.vault.trash(file, false);
					console.log('Moved to Obsidian Trash: ' + file.path);
				} else if (deleteOption === 'system-trash') {
					await app.vault.trash(file, true);
					console.log('Moved to System Trash: ' + file.path);
				} else if (deleteOption === 'permanent') {
					await app.vault.delete(file);
					console.log('Deleted: ' + file.path);
				}
				deletedImages++;
			}
		}
		return deletedImages;
	};

	// Check if File is Under Excluded Folders
	static fileIsInExcludedFolder = (file: TFile, plugin: OzanClearImages): boolean => {
		var excludedFoldersSettings = plugin.settings.excludedFolders;
		var excludeSubfolders = plugin.settings.excludeSubfolders;
		if (excludedFoldersSettings === '') {
			return false;
		} else {
			// Get All Excluded Folder Paths
			var excludedFolderPaths = new Set(
				excludedFoldersSettings.split(',').map((folderPath) => {
					return folderPath.trim();
				})
			);

			if (excludeSubfolders) {
				// If subfolders included, check if any provided path partially match
				for (let exludedFolderPath of excludedFolderPaths) {
					var pathRegex = new RegExp(exludedFolderPath + '.*');
					if (file.parent.path.match(pathRegex)) {
						return true;
					}
				}
			} else {
				// Full path of parent should match if subfolders are not included
				if (excludedFolderPaths.has(file.parent.path)) {
					return true;
				}
			}

			return false;
		}
	};
}

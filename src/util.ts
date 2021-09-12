import { App, TFile } from 'obsidian';
import OzanClearImages from './main';

/* ------------------ Image Handlers  ------------------ */

const imageRegex = /.*(jpe?g|png|gif|svg|bmp)/;
const imageExtensions: Set<string> = new Set(['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp']);

// Create the List of Unused Images
export const getUnusedImages = (app: App) => {
	var allImagesInVault: TFile[] = getAllImagesInVault(app);
	var unusedImages: TFile[] = [];
	var usedImagesSet: Set<string>;

	// Get Used Images in All Markdown Files
	usedImagesSet = getImagePathSetForVault(app);

	// Compare All Images vs Used Images
	allImagesInVault.forEach((img) => {
		if (!usedImagesSet.has(img.path)) unusedImages.push(img);
	});

	return unusedImages;
};

// Getting all available images saved in vault
const getAllImagesInVault = (app: App): TFile[] => {
	let allFiles: TFile[] = app.vault.getFiles();
	let images: TFile[] = [];
	for (let i = 0; i < allFiles.length; i++) {
		if (imageExtensions.has(allFiles[i].extension)) {
			images.push(allFiles[i]);
		}
	}
	return images;
};

// New Method for Getting All Used Images
const getImagePathSetForVault = (app: App): Set<string> => {
	var imagesSet: Set<string> = new Set();
	var resolvedLinks = app.metadataCache.resolvedLinks;
	if (resolvedLinks) {
		for (const [mdFile, links] of Object.entries(resolvedLinks)) {
			for (const [filePath, nr] of Object.entries(resolvedLinks[mdFile])) {
				var imageMatch = filePath.match(imageRegex);
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
				if (typeof frontmatter[k] === 'string' && pathIsAnImage(frontmatter[k])) {
					imagesSet.add(frontmatter[k]);
				}
			}
		}
	});
	return imagesSet;
};

const pathIsAnImage = (path: string) => {
	var match = path.match(imageRegex);
	return match ? true : false;
};

/* ------------------ Deleting Handlers  ------------------ */

// Clear Images From the Provided List
export const deleteFilesInTheList = async (
	fileList: TFile[],
	plugin: OzanClearImages,
	app: App
): Promise<{ deletedImages: number; textToView: string }> => {
	var deleteOption = plugin.settings.deleteOption;
	var deletedImages = 0;
	let textToView = '';
	for (let file of fileList) {
		if (fileIsInExcludedFolder(file, plugin)) {
			console.log('File not referenced but excluded: ' + file.path);
		} else {
			if (deleteOption === '.trash') {
				await app.vault.trash(file, false);
				textToView += `[+] Moved to Obsidian Trash: ` + file.path + '</br>';
			} else if (deleteOption === 'system-trash') {
				await app.vault.trash(file, true);
				textToView += `[+] Moved to System Trash: ` + file.path + '</br>';
			} else if (deleteOption === 'permanent') {
				await app.vault.delete(file);
				textToView += `[+] Deleted Permanently: ` + file.path + '</br>';
			}
			deletedImages++;
		}
	}
	return { deletedImages, textToView };
};

// Check if File is Under Excluded Folders
const fileIsInExcludedFolder = (file: TFile, plugin: OzanClearImages): boolean => {
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

/* ------------------ Helpers  ------------------ */

export const getFormattedDate = () => {
	let dt = new Date();
	return dt.toLocaleDateString('en-GB', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});
};

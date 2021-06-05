import { App, TFile } from "obsidian";
import OzanClearImages from './main';

export class ImageUtils {

    static imageRegex = /.*(jpe?g|png|gif|svg|bmp)/;
    static imageExtensions: Set<string> = new Set(['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp']);

    // Create the List of Unused Images
    static getUnusedImages = (app: App) => {
        var all_images_in_vault: TFile[] = ImageUtils.getAllImagesInVault(app);
        var unused_images: TFile[] = [];
        var used_images_set: Set<string>;

        // Get Used Images in All Markdown Files
        used_images_set = ImageUtils.getImagePathSetForVault(app);

        // Compare All Images vs Used Images
        all_images_in_vault.forEach(img => {
            if (!used_images_set.has(img.path)) unused_images.push(img)
        });

        return unused_images
    }

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
    }

    // New Method for Getting All Used Images
    static getImagePathSetForVault = (app: App): Set<string> => {
        var images_set: Set<string> = new Set();
        var resolvedLinks = app.metadataCache.resolvedLinks;
        if (resolvedLinks) {
            for (const [md_file, links] of Object.entries(resolvedLinks)) {
                for (const [file_path, nr] of Object.entries(resolvedLinks[md_file])) {
                    var image_match = file_path.match(ImageUtils.imageRegex);
                    if (image_match) images_set.add(image_match[0]);
                }
            }
        }
        return images_set
    }

}

export class DeleteUtils {

    // Clear Images From the Provided List
    static deleteFilesInTheList = async (fileList: TFile[], plugin: OzanClearImages, app: App): Promise<number> => {
        var deleteOption = plugin.settings.deleteOption;
        var deletedImages = 0;
        for (let file of fileList) {
            if (DeleteUtils.file_is_in_excluded_folder(file, plugin)) {
                console.log('File not referenced but excluded: ' + file.path)
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
    }

    // Check if File is Under Excluded Folders
    static file_is_in_excluded_folder = (file: TFile, plugin: OzanClearImages): boolean => {
        var excludedFoldersSettings = plugin.settings.excludedFolders;
        var excludeSubfolders = plugin.settings.excludeSubfolders;
        if (excludedFoldersSettings === '') {
            return false
        } else {

            // Get All Excluded Folder Paths
            var excludedFolderPaths = new Set(excludedFoldersSettings.split(",").map(folderPath => {
                return folderPath.trim()
            }));

            if (excludeSubfolders) {
                // If subfolders included, check if any provided path partially match
                for (let exludedFolderPath of excludedFolderPaths) {
                    var pathRegex = new RegExp(exludedFolderPath + '.*')
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
    }

}

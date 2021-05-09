import { App, Notice, TFile } from 'obsidian';

const image_regex = /.*(jpe?g|png|gif|svg|ti?f|bmp)/

// Alternative Getting Images from the Markdown File
const getImageFilesFromMarkdown = async (app: App, file: TFile) => {
    var images: TFile[] = [];
    var image: TFile;
    var metaData = app.metadataCache.getFileCache(file);
    if(metaData.embeds){
        for(let embed of metaData.embeds){
            var image_match = embed.link.match(image_regex)
            if(image_match){
                image = app.metadataCache.getFirstLinkpathDest(decodeURIComponent(image_match[0]), file.path);
                if(image != null) images.push(image);
            }
        }
    }
    return await Promise.all(images);
}

// Getting all available images saved in vault
const getAllImagesInVault = (app: App): TFile[] => {
    let allFiles : TFile[] = app.vault.getFiles();
    let images : TFile[] = [];
    const imageRegex = /.*(jpe?g|png|gif|svg|bmp)/
    for(let i=0; i < allFiles.length; i++){
        if(allFiles[i].path.match(imageRegex)){
            images.push(allFiles[i]);
        }
    }
    return images;
}

// Check if image in the list
const imageInTheFileList = (image: TFile, list: TFile[]) => {
    for(let i=0; i < list.length; i++){
        if(list[i] === image) return true;
    }
    return false;
}

// Clear Images From the Provided List
const deleteFilesInTheList = (app: App, fileList: TFile[]) => {
    fileList.forEach( file => {
        app.vault.delete(file);
        console.log('Deleted: ' + file.path);
    })
}

// Compare Used Images with all images and return unused ones
const clearUnusedImages = async (app: App) => {
    var all_images_in_vault: TFile[] = getAllImagesInVault(app);
    var unused_images : TFile[] = [];
    var markdown_files_in_vault = app.vault.getMarkdownFiles();
    var used_images: TFile[] = [];

    // Get Used Images in All Markdown Files
    await Promise.all(
        markdown_files_in_vault.map( async file => {
            var new_images = await getImageFilesFromMarkdown(app, file);
            new_images.forEach( img => used_images.push(img) );
        })
    )
    
    // Compare All Images vs Used Images
    all_images_in_vault.forEach( img => {
        if(!imageInTheFileList(img, used_images)) unused_images.push(img)
    });

    var len = unused_images.length;
    
    if(len > 0){
        console.log('[+] Deleting ' + len + ' images.');
        deleteFilesInTheList(app, unused_images);
        new Notice(len + ' image(s) in total deleted.');
        console.log('[+] Delete completed.');
    }else{
        new Notice('All images are used. Nothing was deleted.');
    }
}

export { clearUnusedImages };
import { App, Notice, TFile } from 'obsidian';

// Regex for [[ ]] format
const image_line_regex_1 = /!\[\[.*(jpe?g|png|gif|svg).*\]\]/g;
const file_name_regex_1 = /(?<=\[\[).*(jpe?g|png|gif|svg)/;
// Regex for ![ ]( ) format
const image_line_regex_2 = /!\[(^$|.*)\]\(.*(jpe?g|png|gif|svg)\)/g;
const file_name_regex_2 = /(?<=\().*(jpe?g|png|gif|svg)/;


// Getting Images from Lines matching Image Regexes
const getImageFilesFromMarkdown = async (app: App, file: TFile) => {
    var content = await app.vault.read(file);
    var images: TFile[] = [];
    var matches_1 = content.match(image_line_regex_1);
    var matches_2 = content.match(image_line_regex_2);
    var image;
    var file_name_match;
    
    if(matches_1){
        matches_1.forEach( match => {
            file_name_match = match.match(file_name_regex_1);
            image = app.metadataCache.getFirstLinkpathDest(decodeURIComponent(file_name_match[0]), file.path)
            if(image != null) images.push(image);
        });
    }
    
    if(matches_2){
        matches_2.forEach( match => {
            file_name_match = match.match(file_name_regex_2);
            image = app.metadataCache.getFirstLinkpathDest(decodeURIComponent(file_name_match[0]), file.path)
            if(image != null) images.push(image);
        });
    }

    return await Promise.all(images);
}

// Getting all available images saved in vault
const getAllImagesInVault = (app: App): TFile[] => {
    let allFiles : TFile[] = app.vault.getFiles();
    let images : TFile[] = [];
    const imageRegex = /.*(jpe?g|png|gif|svg)/
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
    })
}

// Compare Used Images with all images and return unused ones
const clearUnusedImages = (app: App) => {
    var all_images_in_vault: TFile[] = getAllImagesInVault(app);
    var unused_images : TFile[] = []
    var markdown_files_in_vault = app.vault.getMarkdownFiles();
    var used_images: TFile[] = [];

    // Get Path of Used Imags in the Vault
    markdown_files_in_vault.forEach( async file => {
        var new_images = await getImageFilesFromMarkdown(app, file);
        new_images.forEach( img => {
            used_images.push(img);
        })
    })

    setTimeout( () => {
        all_images_in_vault.forEach( img => {
            if(!imageInTheFileList(img, used_images)){
                unused_images.push(img);
            }
        });
        var len = unused_images.length;
        if(len > 0){
            console.log('Deleting ' + len + ' images.')
            deleteFilesInTheList(app, unused_images);
            new Notice(len + ' image(s) deleted.')
        }else{
            new Notice('All images are used. Nothing was deleted.')
        }
    }, 3000)
}

export { clearUnusedImages };
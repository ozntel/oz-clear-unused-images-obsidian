import { App, TFile} from 'obsidian';
import OzanClearImages from './main';
import { getAllLinkMatchesInFile, LinkMatch } from './linkDetector';
import { i18n } from './i18n';

/* ------------------ Image Handlers  ------------------ */

const imageRegex = /.*(jpe?g|png|gif|svg|bmp)/i;
const bannerRegex = /!\[\[(.*?)\]\]/i;
const imageExtensions: Set<string> = new Set(['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp', 'webp']);

// Create the List of Unused Images
export const getUnusedAttachments = async (app: App, type: 'image' | 'all') => {
    var allAttachmentsInVault: TFile[] = getAttachmentsInVault(app, type);
    var unusedAttachments: TFile[] = [];
    var usedAttachmentsSet: Set<string>;

    // Get Used Attachments in All Markdown Files
    usedAttachmentsSet = await getAttachmentPathSetForVault(app);

    // Compare All Attachments vs Used Attachments
    allAttachmentsInVault.forEach((attachment) => {
        if (!usedAttachmentsSet.has(attachment.path)) unusedAttachments.push(attachment);
    });

    return unusedAttachments;
};

// Getting all available images saved in vault
const getAttachmentsInVault = (app: App, type: 'image' | 'all'): TFile[] => {
    let allFiles: TFile[] = app.vault.getFiles();
    let attachments: TFile[] = [];
    for (let i = 0; i < allFiles.length; i++) {
        if (!['md', 'canvas'].includes(allFiles[i].extension)) {
            // Only images
            if (imageExtensions.has(allFiles[i].extension.toLowerCase())) {
                attachments.push(allFiles[i]);
            }
            // All Files
            else if (type === 'all') {
                attachments.push(allFiles[i]);
            }
        }
    }
    return attachments;
};

// New Method for Getting All Used Attachments
const getAttachmentPathSetForVault = async (app: App): Promise<Set<string>> => {
    const attachmentsSet = new Set<string>();
    // 用公开类型替代未导出的 MetadataCacheResolvedLinks
    const resolvedLinks = app.metadataCache.resolvedLinks as Record<string, Record<string, number>>;

    // 步骤 1：使用官方 API 获取所有已解析的链接（核心场景）
    if (resolvedLinks) {
        for (const [sourceFilePath, linkMap] of Object.entries(resolvedLinks)) {
            for (const [targetPath, _count] of Object.entries(linkMap)) {
                if (!targetPath.endsWith('.md')) {
                    addToSet(attachmentsSet, targetPath);
                }
            }
        }
    }

    // 步骤 2：补充解析 Frontmatter 和 Canvas（官方 API 覆盖不到的场景）
    const allFiles = app.vault.getFiles();
    for (const file of allFiles) {
        // 2.1 处理 Markdown 文件的 Frontmatter
        if (file.extension === 'md') {
            const fileCache = app.metadataCache.getFileCache(file);
            if (fileCache?.frontmatter) {
                for (const [_key, value] of Object.entries(fileCache.frontmatter)) {
                    if (typeof value === 'string' && pathIsAnImage(value)) {
                        const resolvedFile = app.metadataCache.getFirstLinkpathDest(value, file.path);
                        if (resolvedFile instanceof TFile) {
                            addToSet(attachmentsSet, resolvedFile.path);
                        } else {
                            addToSet(attachmentsSet, value);
                        }
                    }
                }
            }
        }

        // 2.2 处理 Canvas 文件（无任何未定义变量）
        else if (file.extension === 'canvas') {
            try {
                const canvasContent = await app.vault.cachedRead(file);
                const canvasData = JSON.parse(canvasContent);
                
                if (Array.isArray(canvasData.nodes)) {
                    for (const node of canvasData.nodes) {
                        // 处理 Canvas 中的文件节点
                        if (node.type === 'file' && typeof node.file === 'string') {
                            addToSet(attachmentsSet, node.file);
                        }
                        // 处理 Canvas 文本节点中的链接（无 tempLinkMap 相关代码）
                        else if (node.type === 'text' && typeof node.text === 'string') {
                            // 复用链接检测函数解析文本中的链接
                            const linkMatches = await getAllLinkMatchesInFile(file, app, node.text);
                            for (const linkMatch of linkMatches) {
                                if (!linkMatch.linkText.endsWith('.md')) {
                                    addToSet(attachmentsSet, linkMatch.linkText);
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn(`解析 Canvas 文件失败：${file.path}`, e);
            }
        }
    }

    return attachmentsSet;
};

const pathIsAnImage = (path: string) => {
    return path.match(imageRegex);
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
                textToView += `[+] ${i18n.t('logs.moved.obsidian.trash')}: ` + file.path + '</br>';
            } else if (deleteOption === 'system-trash') {
                await app.vault.trash(file, true);
                textToView += `[+] ${i18n.t('logs.moved.system.trash')}: ` + file.path + '</br>';
            } else if (deleteOption === 'permanent') {
                await app.vault.delete(file);
                textToView += `[+] ${i18n.t('logs.deleted.permanently')}: ` + file.path + '</br>';
            }
            deletedImages++;
        }
    }
    return { deletedImages, textToView };
};

// Check if File is Under Excluded Folders
export const fileIsInExcludedFolder = (file: TFile, plugin: OzanClearImages): boolean => {
    var excludedFoldersSettings = plugin.settings.excludedFolders;
    var excludeSubfolders = plugin.settings.excludeSubfolders;
    if (excludedFoldersSettings === '') {
        return false;
    } else {
        // Get All Excluded Folder Paths
        var excludedFolderPaths = excludedFoldersSettings.split(',').map((folderPath) => {
            return folderPath.trim();
        });

        // Handle the case where file might not have a parent (shouldn't happen for files in folders, but be safe)
        if (!file.parent) {
            return false;
        }

        if (excludeSubfolders) {
            // If subfolders included, check if the file's parent path starts with any excluded folder path
            for (let excludedFolderPath of excludedFolderPaths) {
                // Normalize the excluded path to ensure proper matching by adding a trailing slash
                // This prevents partial matches like 'Attach' matching 'Attachment'
                let normalizedExcludedPath = excludedFolderPath;
                if (!normalizedExcludedPath.endsWith('/')) {
                    normalizedExcludedPath += '/';
                }
                
                let normalizedFilePath = file.parent.path;
                if (!normalizedFilePath.endsWith('/')) {
                    normalizedFilePath += '/';
                }
                
                if (normalizedFilePath.startsWith(normalizedExcludedPath)) {
                    return true;
                }
            }
        } else {
            // Full path of parent should match if subfolders are not included
            if (excludedFolderPaths.includes(file.parent.path)) {
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

const addToSet = (setObj: Set<string>, value: string) => {
    if (!setObj.has(value)) {
        setObj.add(value);
    }
};

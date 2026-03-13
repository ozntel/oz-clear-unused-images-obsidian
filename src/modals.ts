import { Modal, App, TFile, Notice } from 'obsidian';
import { i18n } from './i18n';

export class LogsModal extends Modal {
    textToView: string;

    constructor(textToView: string, app: App) {
        super(app);
        this.textToView = textToView;
    }

    onOpen() {
        let { contentEl } = this;
        let myModal = this;

        // Information to show
        const logs = contentEl.createEl('div');
        logs.addClass('unused-images-logs');
        logs.innerHTML = this.textToView;

        // Close Button
        const buttonWrapper = contentEl.createEl('div');
        buttonWrapper.addClass('unused-images-center-wrapper');
        const closeButton = buttonWrapper.createEl('button', { text: i18n.t('close') });
        closeButton.addClass('unused-images-button');
        closeButton.addEventListener('click', () => {
            myModal.close();
        });
    }
}

export class SelectiveDeleteModal extends Modal {
    unusedFiles: TFile[];
    app: App;

    constructor(unusedFiles: TFile[], app: App) {
        super(app);
        this.unusedFiles = unusedFiles;
        this.app = app;
    }

    onOpen() {
        let { contentEl } = this;
        let myModal = this;

        // File list container
        const fileListContainer = contentEl.createEl('div', { cls: 'unused-images-file-list' });
        fileListContainer.addClass('unused-images-logs');

        // Create checkboxes for each file
        this.unusedFiles.forEach((file, index) => {
            const fileItem = fileListContainer.createEl('div', { cls: 'unused-file-item' });
            fileItem.addClass('unused-file-item');

            // Checkbox
            const checkbox = fileItem.createEl('input', {
                type: 'checkbox',
                value: index.toString()
            });
            checkbox.addClass('file-checkbox');
            checkbox.checked = true; // Default to checked so all files would be deleted if user clicks "Delete Selected"

            // File name that is clickable to open the file
            const fileName = fileItem.createEl('span', { text: file.path });
            fileName.addClass('clickable-file-path');
            fileName.addEventListener('click', () => {
                // Try to open the file based on its type
                if (file.extension === 'md') {
                    // Open markdown file in the editor
                    this.app.workspace.getLeaf().openFile(file);
                } else {
                    // Open other file types using the default method
                    this.app.workspace.getLeaf().openFile(file);
                }
                // Optionally close the modal after opening the file
                // myModal.close();
            });

            // Ignore button
            const ignoreButton = fileItem.createEl('button', { text: i18n.t('modal.ignore.file') });
            ignoreButton.addClass('ignore-button');
            ignoreButton.style.marginLeft = 'auto';
            ignoreButton.addEventListener('click', async () => {
                try {
                    // Get the plugin instance
                    const plugin = (this.app as any).plugins.plugins['oz-clear-unused-images'];
                    if (plugin) {
                        // Add file path to excludedFiles array
                        if (!plugin.settings.excludedFiles.includes(file.path)) {
                            plugin.settings.excludedFiles.push(file.path);
                            await plugin.saveSettings();
                            
                            new Notice(i18n.t('notice.file.ignored', { file: file.path }));
                            
                            // Close the modal and reopen it with updated file list
                            myModal.close();
                            
                            // Filter out the ignored file and show updated modal
                            const updatedFiles = this.unusedFiles.filter(f => f.path !== file.path);
                            if (updatedFiles.length > 0) {
                                const newModal = new SelectiveDeleteModal(updatedFiles, this.app);
                                newModal.open();
                            } else {
                                new Notice(i18n.t('notice.all.images.used'));
                            }
                        } else {
                            new Notice(i18n.t('notice.file.already.ignored'));
                        }
                    } else {
                        new Notice(i18n.t('notice.plugin.not.found'));
                        console.error('Plugin instance not found. Plugin ID: oz-clear-unused-images');
                    }
                } catch (error) {
                    console.error('Error ignoring file:', error);
                    new Notice(i18n.t('notice.error.ignoring.file', { error: error.message }));
                }
            });
        });

        // Action Buttons
        const buttonWrapper = contentEl.createEl('div');
        buttonWrapper.addClass('unused-images-center-wrapper');
        buttonWrapper.addClass('modal-buttons');

        // Delete Selected Button
        const deleteButton = buttonWrapper.createEl('button', { text: i18n.t('modal.delete.selected') });
        deleteButton.addClass('unused-images-button');
        deleteButton.addClass('delete-button');
        deleteButton.addEventListener('click', async () => {
            const checkboxes = fileListContainer.querySelectorAll<HTMLInputElement>('.file-checkbox');
            const filesToDelete: TFile[] = [];
            checkboxes.forEach((checkbox, index) => {
                if (checkbox.checked) {
                    filesToDelete.push(this.unusedFiles[index]);
                }
            });

            if (filesToDelete.length > 0) {
                try {
                    // Perform deletion directly without confirmation
                    await this.deleteSelectedFiles(filesToDelete);
                } catch (error) {
                    console.error('Error deleting files:', error);
                    new Notice(i18n.t('notice.error.ignoring.file', { error: error.message }));
                } finally {
                    // Always close the modal after attempting to delete
                    myModal.close();
                }
            } else {
                new Notice(i18n.t('notice.no.files.selected'));
            }
        });

        // Select All/None Button
        const selectAllButton = buttonWrapper.createEl('button', { text: i18n.t('modal.select.all') });
        selectAllButton.addClass('unused-images-button');
        selectAllButton.addClass('select-button');
        let isSelectingAll = true;
        selectAllButton.addEventListener('click', () => {
            const checkboxes = fileListContainer.querySelectorAll<HTMLInputElement>('.file-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = isSelectingAll;
            });
            selectAllButton.textContent = isSelectingAll ? i18n.t('modal.deselect.all') : i18n.t('modal.select.all');
            isSelectingAll = !isSelectingAll;
        });

        // Cancel Button
        const cancelButton = buttonWrapper.createEl('button', { text: i18n.t('cancel') });
        cancelButton.addClass('unused-images-button');
        cancelButton.addClass('cancel-button');
        cancelButton.addEventListener('click', () => {
            myModal.close();
        });
    }

    async deleteSelectedFiles(filesToDelete: TFile[]) {
        const plugin = (this.app as any).plugins.plugins['oz-clear-unused-images'];
        
        // Check if plugin instance exists before accessing settings
        if (!plugin) {
            console.error('Plugin instance not found. Plugin ID: oz-clear-unused-images');
            new Notice(i18n.t('notice.plugin.reload.required'));
            return;
        }
        
        const deleteOption = plugin.settings.deleteOption || '.trash';

        // Import the fileIsInExcludedFolder function to respect exclusion settings
        const { fileIsInExcludedFolder } = await import('./util');

        let deletedCount = 0;
        for (const file of filesToDelete) {
            // Check if the file is in an excluded folder before deleting
            if (fileIsInExcludedFolder(file, plugin)) {
                console.log('File not referenced but excluded: ' + file.path);
                continue; // Skip this file, it's in an excluded folder
            }

            if (deleteOption === '.trash') {
                await this.app.vault.trash(file, false);
            } else if (deleteOption === 'system-trash') {
                await this.app.vault.trash(file, true);
            } else if (deleteOption === 'permanent') {
                await this.app.vault.delete(file);
            }
            deletedCount++;
        }

        new Notice(i18n.t('notice.deleted.success', { count: deletedCount.toString() }));
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

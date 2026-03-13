/**
 * i18n 翻译模板文件
 * 
 * 如果你想为插件添加新的语言翻译，请复制此文件，
 * 将所有翻译值替换为你的语言，然后按照以下步骤操作：
 * 
 * 1. 将你的翻译对象添加到 src/i18n.ts 中
 * 2. 更新 translationsMap 添加你的语言映射
 * 3. 更新 Language 类型包含你的语言代码
 * 4. 在 detectLanguage() 方法中添加你的语言检测逻辑
 * 
 * 示例：添加西班牙语翻译
 */

// 定义翻译类型（用于 TypeScript 类型检查）
interface TemplateI18nTranslations {
    // 通用
    'close': string;
    'cancel': string;
    'delete': string;
    'ignore': string;
    'confirm': string;
    
    // 命令名称
    'command.clear.images': string;
    'command.clear.attachments': string;
    
    // 通知消息
    'notice.all.images.used': string;
    'notice.all.attachments.used': string;
    'notice.file.ignored': string;
    'notice.file.already.ignored': string;
    'notice.plugin.not.found': string;
    'notice.error.ignoring.file': string;
    'notice.deleted.success': string;
    'notice.no.files.selected': string;
    'notice.plugin.reload.required': string;
    
    // 设置界面
    'settings.title': string;
    'settings.ribbonIcon.name': string;
    'settings.ribbonIcon.desc': string;
    'settings.logsModal.name': string;
    'settings.logsModal.desc': string;
    'settings.deleteOption.name': string;
    'settings.deleteOption.desc': string;
    'settings.deleteOption.permanent': string;
    'settings.deleteOption.obsidian.trash': string;
    'settings.deleteOption.system.trash': string;
    'settings.excludedFolders.name': string;
    'settings.excludedFolders.desc': string;
    'settings.excludedFiles.name': string;
    'settings.excludedFiles.desc': string;
    'settings.excludeSubfolders.name': string;
    'settings.excludeSubfolders.desc': string;
    
    // 模态框
    'modal.select.files.to.delete': string;
    'modal.delete.selected': string;
    'modal.select.all': string;
    'modal.deselect.all': string;
    'modal.ignore.file': string;
    'modal.file.path.click.hint': string;
    
    // 删除日志
    'logs.moved.obsidian.trash': string;
    'logs.moved.system.trash': string;
    'logs.deleted.permanently': string;
}

// 以下是完整的翻译键列表 - 请为每个键提供你的语言翻译

const yourLanguageTranslations: Partial<TemplateI18nTranslations> = {
    // ==================== 通用 ====================
    'close': '',           // 例如：English = "Close"
    'cancel': '',          // 例如：English = "Cancel"
    'delete': '',          // 例如：English = "Delete"
    'ignore': '',          // 例如：English = "Ignore"
    'confirm': '',         // 例如：English = "Confirm"
    
    // ==================== 命令名称 ====================
    'command.clear.images': '',        // 清除未使用的图片
    'command.clear.attachments': '',   // 清除未使用的附件
    
    // ==================== 通知消息 ====================
    'notice.all.images.used': '',                    // 所有图片都被使用或在排除文件夹中
    'notice.all.attachments.used': '',               // 所有附件都被使用或在排除文件夹中
    'notice.file.ignored': `File ignored: ${'{file}'}`,  // 已忽略文件：{file}
    'notice.file.already.ignored': '',               // 该文件已在忽略列表中
    'notice.plugin.not.found': '',                   // 无法找到插件实例
    'notice.error.ignoring.file': `Error ignoring file: ${'{error}'}`,  // 忽略文件时出错：{error}
    'notice.deleted.success': `Successfully deleted ${'{count}'} file(s).`,  // 成功删除 {count} 个文件
    'notice.no.files.selected': '',                  // 没有选择要删除的文件
    'notice.plugin.reload.required': '',             // 无法找到插件实例，请尝试重新加载插件
    
    // ==================== 设置界面 ====================
    'settings.title': '',                          // 清除图片设置
    'settings.ribbonIcon.name': '',                // 功能区图标
    'settings.ribbonIcon.desc': '',                // 开启后将在功能区显示清除图片的图标
    'settings.logsModal.name': '',                 // 删除日志
    'settings.logsModal.desc': '',                 // 关闭后将不会在删除完成后弹出查看删除日志的模态框
    'settings.deleteOption.name': '',              // 已删除图片的目标位置
    'settings.deleteOption.desc': '',              // 选择图片删除后的存放位置
    'settings.deleteOption.permanent': '',         // 永久删除
    'settings.deleteOption.obsidian.trash': '',    // 移动到 Obsidian 回收站
    'settings.deleteOption.system.trash': '',      // 移动到系统回收站
    'settings.excludedFolders.name': '',           // 排除的文件夹完整路径
    'settings.excludedFolders.desc': '',           // 提供要排除的文件夹的完整路径（区分大小写）
    'settings.excludedFiles.name': '',             // 排除的文件完整路径
    'settings.excludedFiles.desc': '',             // 提供要排除的文件的完整路径（区分大小写）
    'settings.excludeSubfolders.name': '',         // 排除子文件夹
    'settings.excludeSubfolders.desc': '',         // 开启此选项后，将同时排除上述文件夹路径的所有子文件夹
    
    // ==================== 模态框 ====================
    'modal.select.files.to.delete': '',    // 选择要删除的文件
    'modal.delete.selected': '',           // 删除所选文件
    'modal.select.all': '',                // 选择所有文件
    'modal.deselect.all': '',              // 取消选择
    'modal.ignore.file': '',               // 忽略此文件
    'modal.file.path.click.hint': '',      // 点击打开文件
    
    // ==================== 删除日志 ====================
    'logs.moved.obsidian.trash': '',       // 移动到 Obsidian 回收站
    'logs.moved.system.trash': '',         // 移动到系统回收站
    'logs.deleted.permanently': '',        // 永久删除
};

/*
 * 完整示例：日语翻译
 * 
 * const jaTranslations: Partial<TemplateI18nTranslations> = {
 *     'close': '閉じる',
 *     'cancel': 'キャンセル',
 *     'delete': '削除',
 *     'ignore': '無視する',
 *     'confirm': '確認',
 *     
 *     'command.clear.images': '未使用の画像をクリア',
 *     'command.clear.attachments': '未使用の添付ファイルをクリア',
 *     
 *     'notice.all.images.used': 'すべての画像が使用中または除外フォルダーにあります。',
 *     'notice.all.attachments.used': 'すべての添付ファイルが使用中または除外フォルダーにあります。',
 *     'notice.file.ignored': `ファイルを無視しました：${'{file}'}`,
 *     'notice.file.already.ignored': 'このファイルはすでに無視リストにあります',
 *     'notice.plugin.not.found': 'プラグインインスタンスが見つかりません',
 *     'notice.error.ignoring.file': `ファイルの無視中にエラーが発生しました：${'{error}'}`,
 *     'notice.deleted.success': `${'{count}'}個のファイルを正常に削除しました。`,
 *     'notice.no.files.selected': '削除するファイルが選択されていません。',
 *     'notice.plugin.reload.required': 'プラグインインスタンスが見つかりません。プラグインを再読み込みしてください。',
 *     
 *     'settings.title': '画像クリア設定',
 *     'settings.ribbonIcon.name': 'リボンアイコン',
 *     'settings.ribbonIcon.desc': 'リボンに画像クリアのアイコンを表示します。',
 *     'settings.logsModal.name': '削除ログ',
 *     'settings.logsModal.desc': '削除完了後にログモーダルを表示します。',
 *     'settings.deleteOption.name': '削除された画像の宛先',
 *     'settings.deleteOption.desc': '削除された画像の保存先を選択します',
 *     'settings.deleteOption.permanent': '完全に削除',
 *     'settings.deleteOption.obsidian.trash': 'Obsidian ゴミ箱に移動',
 *     'settings.deleteOption.system.trash': 'システムゴミ箱に移動',
 *     'settings.excludedFolders.name': '除外するフォルダーのフルパス',
 *     'settings.excludedFolders.desc': '除外するフォルダーのフルパスをカンマ区切りで指定します（大文字小文字を区別）。',
 *     'settings.excludedFiles.name': '除外するファイルのフルパス',
 *     'settings.excludedFiles.desc': '除外するファイルのフルパスをカンマ区切りで指定します（大文字小文字を区別）。',
 *     'settings.excludeSubfolders.name': 'サブフォルダーを除外',
 *     'settings.excludeSubfolders.desc': '有効にすると、上記のフォルダーパスのすべてのサブフォルダーも除外されます。',
 *     
 *     'modal.select.files.to.delete': '削除するファイルを選択',
 *     'modal.delete.selected': '選択したファイルを削除',
 *     'modal.select.all': 'すべて選択',
 *     'modal.deselect.all': '選択解除',
 *     'modal.ignore.file': 'このファイルを無視',
 *     'modal.file.path.click.hint': 'クリックしてファイルを開く',
 *     
 *     'logs.moved.obsidian.trash': 'Obsidian ゴミ箱に移動',
 *     'logs.moved.system.trash': 'システムゴミ箱に移動',
 *     'logs.deleted.permanently': '完全に削除',
 * };
 */

export default yourLanguageTranslations;

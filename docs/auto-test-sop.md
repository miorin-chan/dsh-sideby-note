# 边记部本机实装与验收 SOP

本地交付在当前使用的 DSH profile 里完成。
先备份 `.dsh` 中的宿主便笺和附件，再构建、更新并验收现有的 `@miorin/dsh-sideby-note` 条目。
沿用原包名、安装来源与 `dsh-sideby-note` 行 ID。

## 1. 备份宿主便笺和附件

- 记录运行中的 profile、现有插件来源和待部署的 Git 提交。
  可在「插件」详情或 DSH 插件管理工具中确认来源。
- 确认宿主清单位于 `$DSH_HOME/storages/aside_note.json`（或当前存储后端配置目录）。
  等正在保存的便笺和附件写入完毕后，一起复制清单及其旁边的 `dsh-sideby-note-attachments/`。
  默认清单位于 `$DSH_HOME/storages/aside_note.json`。
- 备份范围限于 `$DSH_HOME` 下的宿主清单和附件目录。
  宿主清单尚未创建时，在验收记录中写明该状态。
- 备份留在本机私有目录。验收记录只保留备份路径、数据范围和校验结果。

宿主清单存在时，在 macOS 可用下面的命令复制并核对宿主文件。
按面板显示的路径设置 `SIDEBY_NOTE_STORE`，或使用默认值。
`SIDEBY_NOTE_BACKUP_ROOT` 可指定已有写权限的本机备份目录。

```bash
set -e
umask 077
sideby_home=${DSH_HOME:-$HOME/.dsh}
sideby_store=${SIDEBY_NOTE_STORE:-$sideby_home/storages/aside_note.json}
sideby_attachments="$(dirname "$sideby_store")/dsh-sideby-note-attachments"
sideby_backup_root=${SIDEBY_NOTE_BACKUP_ROOT:-$sideby_home/backups/sideby-note}
test -f "$sideby_store"
mkdir -p "$sideby_backup_root"
sideby_backup=$(mktemp -d "${sideby_backup_root%/}/sideby-note.XXXXXXXX")
cp -p "$sideby_store" "$sideby_backup/aside_note.json"
if test -d "$sideby_attachments"; then
  cp -R -p -P "$sideby_attachments" "$sideby_backup/dsh-sideby-note-attachments"
  diff -qr "$sideby_attachments" "$sideby_backup/dsh-sideby-note-attachments"
fi
cmp -s "$sideby_store" "$sideby_backup/aside_note.json"
printf 'Backup: %s\n' "$sideby_backup"
```

## 2. 构建并直接更新现有条目

1. 备份完成后在现有源码目录运行 `npm run check`，生成 Host 和 Client 产物并通过自动化检查。
   本地安装的文件可能与源码产物共享硬链接，所以备份要先于会重建产物的命令，包括 `npm ci` 和 `npm test`。
2. 对照现有安装的 `index.js` 和 `client/client.js` 的 SHA-256。
   若两处产物已一致，现有条目已具备部署文件，继续确认运行中的 Host 和页面实际加载情况。
   若不一致，通过 DSH 插件管理按原来源更新现有条目。
   启用「本地插件重载」的环境可以在「插件 → 本地」打开该条目的详情，对照原地址后使用详情里的重载入口。
   该入口会卸载并从所选地址重装，操作前检查显示的地址和权限请求。
3. 根据 DSH 返回的应用状态完成重载，必要时刷新当前页面。
   仅在 DSH 明确要求时安排重启。如果操作被拒绝，记录当前状态和阻塞原因。
4. 再检查安装文件的 SHA-256、原条目的启用状态和当前页面的入口。
   相同的插槽 ID 可用于确认入口已注册，安装文件校验与实际界面验收分别记录。

## 3. 在当前 GUI 验收

- 打开现有会话的边记部，确认入口、角标、面板和既有便笺可读。
- 按改动场景走一遍主要交互。列表排序可用已有数据切换工作区与「全局」，核对待续、归档及工作区跳转后的顺序。
- 新增、归档和失败路径由自动化测试覆盖。需要在界面验证写入时，使用可识别的测试便笺并核对其归属。
  保留当前 GUI 的存储与草稿供对照。
  用于发布的截图按[截图 SOP](./screenshot-sop.md)生成。
- 在 `.test/<时间戳>/` 留下检查日志及验收结论。
  分别记录自动化测试结果、构建与安装校验、实机交互结果和待验证项。
  没有可操作的页面时，记录实机交互未核验。

如果更新引起数据读取异常，先停止写入，记录错误和当前文件状态。
先恢复之前的插件版本或安装来源，再判断是否需要恢复数据。
确认要从备份恢复时，在写入停止后一起恢复宿主清单和附件。
保留更新后新增的数据副本，便于核对。

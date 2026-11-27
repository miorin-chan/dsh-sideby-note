# 边记部

当主代理大功告成之际，过去的你异步发出的思绪将如闪电般归来

[English](README.en.md) | 中文

> **个人改版说明**：本项目由 [光吟（LighghtEeloo）](https://github.com/LighghtEeloo) 改版，基于并受原作者 [阿三石（Rayle8）](https://github.com/Rayle8) 的 [dsh-aside-note](https://github.com/Rayle8/dsh-aside-note)（旁边记 / AsideNote）启发，仅作个人使用，正文大部分保留自原 README。与上游的主要区别：
>
> - 中文界面名称改为「边记部」；包名与 npm 更新通道为 `@miorin/dsh-sideby-note`，插件 id 为 `dsh-sideby-note`，安装命令为 `npx @miorin/dsh-sideby-note install`。
> - **移除匿名功能统计**：不再内置腾讯云 RUM SDK，不发送任何使用事件；设置 › 隐私中的统计开关与相关本地存储键一并移除。
> - 沿用上游的 `dsh.aside-note.*` 存储键；升级时会自动迁移旧会话便笺。
> - README 截图来自本改版，而非上游版本。

[边记部源码](https://github.com/miorin-chan/dsh-sideby-note)

轻量记录 · 按需打开 · 用完收起

边记部是面向 DeepSeek Harness（DSH）的轻量工作区便笺。临时的想法、稍后的待办，随手留在对话旁；需要时一键带回，用完收起，继续眼前的事。

## 界面与入口

以下预览拍摄于页脚改版前。

![边记部右侧面板](./docs/assets/preview-right.png)

暗色主题下外观保持一致，颜色全部取自 DSH 主题令牌：

![边记部右侧面板（暗色）](./docs/assets/preview-right-dark.png)

会话顶部右侧的「边记部」按钮，带待续数量：

<img src="./docs/assets/preview-badge.png" width="460" alt="顶部右侧边记部按钮">

暗色主题下的同一按钮：

<img src="./docs/assets/preview-badge-dark.png" width="460" alt="顶部右侧边记部按钮（暗色）">

点击入口后在右侧打开固定面板。空白新会话还没有对话头，按钮落在右上角、右侧栏按钮左侧。此时也可以查看「全局」，绑定工作区时还可以选择「工作区」。

## 快速安装

边记部以 npm 包 `@miorin/dsh-sideby-note` 装进 DSH profile。两种方式选一个：把提示词交给 agent，或自己执行一条命令。

### 通过 agent 安装

把下面这段发给你的 agent：

```text
帮我安装 DSH 插件边记部，在终端执行：npx -y @miorin/dsh-sideby-note install
装好后不用重启 DSH，会话右上角即可看到「边记部」入口；如果没出现，
让我到「插件」页刷新，再把它手动关闭并开启一次。
如果提示找不到 DSH 或找不到 profile，转告我先安装并启动 DeepSeek Harness 再重试；
不要改仓库、不要手动拼装依赖、不要重启 DSH。
```

### 通过命令行安装

```bash
npx @miorin/dsh-sideby-note install
```

脚本会从 npm 临时拉取本包，找到 DSH profile（存在 `DSH_PROFILE_DIR` 时用它，否则默认 `~/.dsh/profiles/desktop`），先把 `package.json` 和 `pnpm-lock.yaml` 备份到 `.local-backup/`，再写入依赖、把 `@miorin/dsh-sideby-note` 加入 `dsh.profile.bundles`，然后用 **DeepSeek Harness 自带的 node 与 pnpm** 执行 `pnpm install`（找不到运行时才回退到 PATH 上的 pnpm，可用 `DSH_RUNTIME_DIR` 指定），最后校验装出来的 `client/client.js`。用宿主自己的工具链是为了让 profile 的 pnpm store 与宿主保持一致——换成另一个主版本的 pnpm 写入，宿主下次安装会报 `ERR_PNPM_UNEXPECTED_STORE`。

```bash
npx @miorin/dsh-sideby-note install --profile work    # 指定 profile
npx @miorin/dsh-sideby-note install --dry-run         # 只打印计划，不改任何文件
npx @miorin/dsh-sideby-note install --version 0.1.0   # 固定版本，而不是 ^0.1.0
```

从无 scope 的 `dsh-sideby-note` 升级时，请执行上面的安装命令。安装器会在备份后替换所选 profile 的旧依赖和组合包条目，
便笺和附件仍可在原来的位置读取。旧版的应用内更新无法切换包名。

重复执行是幂等的。装完不需要重启 DSH：profile 会在约 1 秒内重新组合，安装后会话右上角即可看到「边记部」入口。如果入口没有出现，到侧边栏「插件」页刷新，把它关闭再开启一次，运行中的 Host 会重新组合，入口随即可见。

卸载：从 `dsh.profile.bundles` 移除 `@miorin/dsh-sideby-note`，在 profile 目录执行 `pnpm remove @miorin/dsh-sideby-note`，无需重启；右上角入口随之消失，若「插件」页里仍列着它，刷新该页即可。

## 为什么做边记部

和 AI 一起做事时，总会冒出一些暂时顾不上的小事：这个细节等会儿改，那段结果还要核对，还有一个思路想留着继续讨论。

先发进对话，容易打断当前任务；记到别处，回来又得重新找。边记部就在会话旁边，让你先把事情记下，继续手头的工作。

不必为几件小事建立一套管理方法。想到就记，需要就看，做完就放下。它只在你需要时打开，用完收起，尽量少打扰当前的工作。

## 从随手记，到继续做

### 想到就记，继续手头的事

点击会话顶部右侧的「边记部」按钮，打开右侧面板，记录待办、补充想法或需要回看的细节。入口显示待续数量。
提示词输入框右侧的「发至边记部」可将不超过 280 字的纯文本草稿移入当前工作区的「待续」，并绑定当前会话。

### 留在工作区，下次接着做

面板标题栏的「全局」汇总所有工作区的便笺。待续按创建时间、归档按归档时间，默认最新的在前。
展开分区后，悬停在标题上可切换排序。选择「按工作区」后，当前工作区排在前面，其中绑定当前会话的便笺优先。
选择文件夹图标旁的工作区名，只查看当前工作区。两处数字都是待续数。
入口角标显示所在工作区的待续数，独立会话显示全局待续数。
两个筛选下新增的便笺都写入当前工作区，同一工作区的会话可以接着查看。
未绑定工作区时，新便笺写入专用的未分配工作区，在「全局」中可见。

### 回到原来的对话，或继续在这里做

会话开始后，新建便笺默认绑定当前会话，点录入区的绑定图标可以解绑，已有条目也能更改绑定。空白新会话里仍可记便笺，也可解除草稿或已有便笺的绑定，但不能新建绑定。便笺仍属于原工作区，筛选和待续数不变。条目下方的「工作区 / 会话」可分别跳转；退回编辑时保留原来的绑定状态。

未绑定的便笺可直接「填入」当前会话。已绑定的便笺只能在绑定会话中填入。返回会话本身不修改草稿。点「填入」后，正文和所有附件加入对话草稿，便笺归档。已有正文时，便笺正文另起一行。你可以继续补充、调整，再决定发送。

### 日常使用的小细节，也准备好了

- **草稿自动保存**：临时关闭面板，再打开接着写；同一工作区的会话共用同一份草稿，切换会话也不用重打。
- **归档后可回看**：待续与归档分区展示，保留创建与归档时间。
- **面板大小可调整**：宽高按需拖动，记住你的习惯。
- **融入 DSH 界面**：跟随明暗主题与 DSH 全部八种官方语言（中文、英语、日语、西班牙语、法语、德语、俄语和巴西葡萄牙语）。
- **跟随 DSH 本地文件持久保存**：便笺写入 `~/.dsh/storages/aside_note.json`，刷新、重启、换浏览器都不丢；同一浏览器的多标签页实时同步；同一 Host 的其他浏览器在打开面板时刷新。在面板底部展开「存储」，即可查看完整路径、复制路径或在文件管理器中定位。

> 宿主存储可用时，同一 DSH 宿主上的浏览器共享便笺。升级和回落行为见[数据保存在哪里](#数据保存在哪里)。

[查看安装方法](#快速安装) · [反馈问题或建议](https://github.com/miorin-chan/dsh-sideby-note/issues)

## 功能

- **跨工作区查看**：「全局」可以查看其他工作区的便笺，修改仍保存在该条便笺所属的工作区。同一浏览器的多个标签页同步更新。
- **入口与面板**：会话顶部右侧的图标按钮用角标显示待续数；空白新会话在右上角出现；点击打开固定面板并与之对齐，DSH 右侧栏打开时自动左移。点击面板外部会收起面板，草稿保留。
- **条目操作**：添加、拖动排序、复制、填入、退回输入框重新编辑；不再手动勾选完成，填入即归档。「清空归档」需要二次确认，归档中的条目可展开回看。退回后清空输入框即等于删除该条。
- **附件**：点击回形针、粘贴剪贴板文件，或把文件拖到录入区。每条便笺可附最多 10 个非空文件，每个最多 25 MiB，也可以只保存附件。常见图片、音频和视频可以点文件名预览，所有附件都可以下载原文件。附件随草稿保存，退回时跟正文一起恢复。
- **填入**：把便笺正文和原始附件带进当前会话的草稿，已有内容和附件会保留。已绑定的便笺只允许填入对应会话。纯附件便笺也可填入。输入框接收完整便笺后移入「归档」，由你决定何时发送。附件遵循 DSH 输入框的限制，读取失败或输入框拒收时，便笺留在「待续」。
- **拖动排序**：在「待续」标题上选择「手动排序」后，便笺可以在所属工作区内拖动重排，也可聚焦左侧「填入」按钮后用 ↑ / ↓ 逐条移动。拖动中按 Esc 取消。
- **状态记忆**：新增草稿按工作区自动保存（工作区之外的会话按会话），切换会话或筛选时保留草稿。重新打开面板会恢复草稿，并记住「待续 / 归档」的展开状态、排序与筛选选择。
- **面板尺寸**：拖左边缘调宽度、拖底部把手调高度，双击复位；宽高都保存在浏览器里。
- **列表分区**：「待续」「归档」各有吸顶标题与独立滚动，展开归档不会压缩待续。待续便笺左侧显示「填入」，右侧悬停时由时间切换为「复制 / 退回」。
- **存储**：页脚的「存储」默认折叠。展开后可查看存储状态和宿主文件路径，也可复制路径或在文件管理器中定位。切换到宿主存储后若连接失效，面板会直接显示原因与「重新连接」。
- **界面融入**：颜色、圆角、阴影与滚动条全部复用 DSH 设计令牌，自动适配明暗主题与 DSH 全部官方语言；详见[设计规范](#设计规范)。

## 功能截图

以下为上一版面板的实拍，明暗同源（同一演示会话、同一批便笺，只切换主题）。新版的存储详情位于页脚。

<table>
  <tr>
    <th width="130">功能</th>
    <th>明色</th>
    <th>暗色</th>
  </tr>
  <tr>
    <td>面板总览<br>待续 / 归档分区</td>
    <td><img src="./docs/assets/features/panel.png" width="300" alt="面板总览"></td>
    <td><img src="./docs/assets/features/panel-dark.png" width="300" alt="面板总览（暗色）"></td>
  </tr>
  <tr>
    <td>旧版设置<br>关于</td>
    <td><img src="./docs/assets/features/settings.png" width="300" alt="设置"></td>
    <td><img src="./docs/assets/features/settings-dark.png" width="300" alt="设置（暗色）"></td>
  </tr>
  <tr>
    <td>行操作<br>填入、复制与退回</td>
    <td><img src="./docs/assets/features/actions.png" width="300" alt="行操作"></td>
    <td><img src="./docs/assets/features/actions-dark.png" width="300" alt="行操作（暗色）"></td>
  </tr>
  <tr>
    <td>清空归档<br>二次确认，避免误删</td>
    <td><img src="./docs/assets/features/clear.png" width="300" alt="清空归档确认"></td>
    <td><img src="./docs/assets/features/clear-dark.png" width="300" alt="清空归档确认（暗色）"></td>
  </tr>
  <tr>
    <td>空状态<br>还没有记录时的引导</td>
    <td><img src="./docs/assets/features/empty.png" width="300" alt="空状态"></td>
    <td><img src="./docs/assets/features/empty-dark.png" width="300" alt="空状态（暗色）"></td>
  </tr>
</table>

## 设计规范

录入区的长期目标见[原生输入框能力与组件复用](./docs/panel-ui-rules.md#原生输入框能力与组件复用)。

面板与入口按钮的样式由 `src/client/styles/panel.css` 的令牌块统一驱动，改一处即可全站生效：

| 维度 | 令牌 | 取值 |
| --- | --- | --- |
| 颜色 | `--dsw-alias-*` | 直接复用 DSH 语义别名（墨色 / 悬停 / 描边 / 状态 / 设置卡），插件不再自建灰阶 |
| 字号 | `--an-fs-caption/row/title` | 12 / 13 / 14，行高统一 20 |
| 字重 | 400 / 500 | 上限 500，强调靠字号与墨色 |
| 间距 | `--an-space-1 … -6` | 4 / 8 / 12 / 16 / 24 / 32 |
| 圆角 | `--dsw-radius-sm/md/lg/panel` + 999 | 8（紧凑控件）/ 16（分组与字段）/ 28（浮动面板）/ 胶囊配 `corner-shape:round` |
| 阴影 | `--dsw-elevation-panel` | 浮层 `border:0`，0.5px 发丝描边画在阴影第一层 |
| 材质 | `--dsh-an-panelSurface`（`--dsw-alias-bg-layer-2`） | 实心面板表面，与吸顶块共用同一颜色 |
| 动效 | `--ds-transition-duration*`、`--ds-ease-in-out` | 100 / 200ms，只动 opacity 与 transform |
| 滚动条 | 主题共享 skin | 面板内只重绑 `--dsh-scrollbar-*` 到 l2，并为列表设置 9px 轨道 / 2px 内缩 |

反馈层同样复用产品能力：复制、填入、退回、清空归档与写失败都经 `shell.overlay` 的全局 Toast 报告，面板关闭后仍然可见；图标按钮用 `ui-primitives` 的 `Tooltip`。

## 使用

1. 点击会话顶部右侧的「边记部」按钮，打开右侧面板。点击标题栏的「全局」或带文件夹图标的工作区名来筛选便笺。
2. 在面板里写一条具体的小事，点击正文下方的「↵」或按 Enter 添加。按 Shift+Enter 换行。
3. 需要改一条便笺时，点该条右侧的「退回」，内容回到顶部输入框，改完后提交到原工作区。退回后清空输入框就删除了这一条。
4. 想调整同一工作区内的先后时，按住待续便笺正文拖到新位置（或聚焦左侧「填入」按钮后按 ↑ / ↓）。
5. 需要继续处理时，点该条便笺的「填入」，内容追加到对话输入框、便笺同时归档，确认后自行发送；点「归档」展开回看。
6. 点面板上的关闭按钮、再次点页头入口或按 Esc 关闭。桌面版可用 `Mod+E` 打开或收起面板（macOS 是 `⌘E`，其他平台是 `Ctrl+E`）。
   macOS 和 Windows 浏览器版默认用 `Mod+Alt+E`，Linux 浏览器版默认未绑定。
   按 `Mod+/` 或从 DSH 的「设置 › 编辑快捷键」打开快捷键窗口，搜索「打开或收起边记部」即可改键、停用或恢复默认。

## 数据保存在哪里

宿主存储可用时，便笺写入 `$DSH_HOME/storages/aside_note.json`，默认路径为 `~/.dsh/storages/aside_note.json`。迁移完成后，便笺均保存在工作区表中，宿主格式保留会话表用于读取旧数据。展开面板页脚的「存储」可查看实际路径。

- 首次启动先检查宿主。宿主存储为空时，从 `dsh.aside-note` 和 `dsh.aside-note.workspaces` 导入浏览器里的旧便笺，并保留原副本供恢复。宿主已有便笺时，使用宿主清单，原浏览器副本仍可用于恢复。
- 旧会话便笺自动移入所属工作区，归属未知的便笺放入未分配工作区，可在「全局」中查看。迁移细节见[架构文档](./docs/architecture.md#4-数据模型)。
- 切换前若宿主不可用，本次继续使用浏览器存储，下次启动时重试。切换后若宿主不可用或文件损坏，面板会直接显示原因并暂停写入。宿主恢复后可在提示旁点击「重新连接」。
- 连接同一 DSH 宿主的浏览器共享宿主便笺。附件需要宿主 JSON 存储，原文件保存在 `aside_note.json` 旁的 `dsh-sideby-note-attachments/`，草稿的附件引用留在浏览器。迁移时请一起备份 JSON 与附件目录。移除附件或清空归档会移除便笺中的引用，文件仍留在宿主目录。
- 面板尺寸、「待续 / 归档」展开状态及未提交草稿仍存在浏览器。工作区内的会话共用一份草稿，工作区外的会话各自保存草稿。

边记部沿用旁边记 1.2.0 的宿主文件及格式，可以读取已有的宿主便笺，也兼容浏览器中的旧 `dsh.aside-note.*` 数据。DSH 同一时间只允许一个插件打开这份存储。切换时请先停用正在使用它的插件，边记部遇到占用时会提示并暂停写入。

## 开发

宿主源码在 `index.ts` 和 `host/`，客户端源码在 `src/client/`。
更新本机的边记部时，先按[本机实装与验收 SOP](./docs/auto-test-sop.md)备份数据，再构建、更新并验收现用 profile 里的已有条目。

```bash
npm ci         # 安装依赖并生成 Host 和 Client 产物
npm run check  # 类型检查、构建与测试、产物和类型版本校验
npm run build  # 重新生成 index.js、host/*.js 和 client/client.js
npm test       # 构建并运行全部代码测试
```

入口是 `src/client/index.ts`，导出 `apply(ctx)`；tsdown 负责套上 DSH 的加载壳：

```js
window.__ModuleLoader__.load({ id: '@miorin/dsh-sideby-note', factory: (require) => { … } })
```

JavaScript 产物随 npm 包分发，Git 记录 TypeScript 源码和构建配置。CI 用 `npm pack` 核对打包结果，并执行类型检查和代码测试。

`index.ts` 注册宿主更新与便笺存储端点；`cordis.patch.yml` 负责把包插入 profile 的组合。界面依赖 `slots` 与 `locale` 两个服务：

- `conversation.composer.dock`：只用来捕获当前会话 ID，不渲染可见入口。
- 顶部右侧入口由 MutationObserver 注入宿主 header，因为宿主重渲染会回收 React portal。

面板用 `react-dom/client` 的独立 root 挂到 `document.body`，用 fixed 定位跟随入口；所有样式使用 DSH 的 `--dsw-alias-*` 主题变量，自动适配明暗主题。

截图与预览图的产出流程见 [截图与预览图 SOP](./docs/screenshot-sop.md)：在隔离 profile 里造演示会话，一条命令重拍明暗两套；凭据默认不复制。

代码结构、数据模型与构建约定见 [架构文档](./docs/architecture.md)。
用户可见的预期行为见 [行为规则](./docs/behavior.md)，代码测试与 CI 门禁见 [测试工程](./docs/testing.md)。

分支模型、版本策略与发版步骤见 [发布与版本迭代](./docs/release.md)。

## 验证

集成测试覆盖以下面板流程：

- 会话顶部右侧出现「边记部」按钮，角标显示待续数；
- 点击按钮在右侧打开面板，面板右上角对齐入口；
- 添加后按钮角标与面板计数同步；
- 面板内可复制、退回输入框重新编辑、清空归档；「填入并归档」与拖动 / 方向键排序由 jsdom 集成测试驱动；
- 刷新页面后记录仍在；面板头部可在「全局」与「工作区」之间切换；
- 版本检查的 npmjs → npmmirror → GitHub Release 回退、1 小时缓存与版本比较由契约测试覆盖；发布说明的标记提取、中英文回退、上限与 Markdown 压平有独立测试；jsdom 集成测试会驱动面板显示更新卡片、展开说明并通过宿主更新端点完成一次更新。真实更新提示需先发布到 npm 或创建 GitHub Release。

运行 `npm run check` 可执行类型检查、构建、自动化测试以及产物和类型版本校验。

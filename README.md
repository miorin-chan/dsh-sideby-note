# 边记部 · Sideby Note

当主代理大功告成之际，过去的你异步发出的思绪将如闪电般归来

[English](README.en.md) | 中文

> **个人改版说明**：本项目由 [光吟（LighghtEeloo）](https://github.com/LighghtEeloo) 改版，基于并受原作者 [阿三石（Rayle8）](https://github.com/Rayle8) 的 [dsh-aside-note](https://github.com/Rayle8/dsh-aside-note)（旁边记 / AsideNote）启发，仅作个人使用，正文大部分保留自原 README。与上游的主要区别：
>
> - 界面名称与文案改为「边记部 / Sideby Note」；包名、插件 id 与更新通道改为本仓库的 `dsh-sideby-note`，安装命令为 `npx dsh-sideby-note install`。
> - **移除匿名功能统计**：不再内置腾讯云 RUM SDK，不发送任何使用事件；设置 › 隐私中的统计开关与相关本地存储键一并移除。
> - 本地存储键沿用上游的 `dsh.aside-note.*`，升级后已有便笺与设置无需迁移。
> - README 截图来自本改版，而非上游版本。

轻量记录 · 按需打开 · 用完收起

边记部是面向 DeepSeek Harness（DSH）的轻量会话便笺。临时的想法、稍后的待办，随手留在对话旁；需要时一键带回，用完收起，继续眼前的事。

## 界面与入口

![边记部右侧面板](./docs/assets/preview-right.png)

暗色主题下外观保持一致，颜色全部取自 DSH 主题令牌：

![边记部右侧面板（暗色）](./docs/assets/preview-right-dark.png)

会话顶部右侧的「边记部」按钮，带待续数量：

<img src="./docs/assets/preview-badge.png" width="460" alt="顶部右侧边记部按钮">

暗色主题下的同一按钮：

<img src="./docs/assets/preview-badge-dark.png" width="460" alt="顶部右侧边记部按钮（暗色）">

点击入口后在右侧打开固定面板。空白新会话还没有对话头，按钮落在右上角、右侧栏按钮左侧；发出第一条消息前只显示工作区清单。

## 快速安装

边记部以 npm 包 `dsh-sideby-note` 装进 DSH profile。两种方式选一个：把提示词交给 agent，或自己执行一条命令。

### 通过 agent 安装

把下面这段发给你的 agent：

```text
帮我安装 DSH 插件 Sideby Note（边记部），在终端执行：npx -y dsh-sideby-note install
装好后不用重启 DSH，会话右上角即可看到「边记部」入口；如果没出现，
让我到「插件」页刷新，再把它手动关闭并开启一次。
如果提示找不到 DSH 或找不到 profile，转告我先安装并启动 DeepSeek Harness 再重试；
不要改仓库、不要手动拼装依赖、不要重启 DSH。
```

### 通过命令行安装

```bash
npx dsh-sideby-note install
```

脚本会从 npm 临时拉取本包，找到 DSH profile（存在 `DSH_PROFILE_DIR` 时用它，否则默认 `~/.dsh/profiles/desktop`），先把 `package.json` 和 `pnpm-lock.yaml` 备份到 `.local-backup/`，再写入依赖、把 `dsh-sideby-note` 追加进 `dsh.profile.bundles`，然后用 **DeepSeek Harness 自带的 node 与 pnpm** 执行 `pnpm install`（找不到运行时才回退到 PATH 上的 pnpm，可用 `DSH_RUNTIME_DIR` 指定），最后校验装出来的 `client/client.js`。用宿主自己的工具链是为了让 profile 的 pnpm store 与宿主保持一致——换成另一个主版本的 pnpm 写入，宿主下次安装会报 `ERR_PNPM_UNEXPECTED_STORE`。

```bash
npx dsh-sideby-note install --profile work    # 指定 profile
npx dsh-sideby-note install --dry-run         # 只打印计划，不改任何文件
npx dsh-sideby-note install --version 0.1.0   # 固定版本，而不是 ^0.1.0
```

重复执行是幂等的。装完不需要重启 DSH：profile 会在约 1 秒内重新组合，安装后会话右上角即可看到「边记部」入口。如果入口没有出现，到侧边栏「插件」页刷新，把它关闭再开启一次，运行中的 Host 会重新组合，入口随即可见。

卸载：从 `dsh.profile.bundles` 移除 `dsh-sideby-note`，在 profile 目录执行 `pnpm remove dsh-sideby-note`，无需重启；右上角入口随之消失，若「插件」页里仍列着它，刷新该页即可。

## 为什么做边记部

和 AI 一起做事时，总会冒出一些暂时顾不上的小事：这个细节等会儿改，那段结果还要核对，还有一个思路想留着继续讨论。

先发进对话，容易打断当前任务；记到别处，回来又得重新找。边记部就在会话旁边，让你先把事情记下，继续手头的工作。

不必为几件小事建立一套管理方法。想到就记，需要就看，做完就放下。它只在你需要时打开，用完收起，尽量少打扰当前的工作。

## 从随手记，到继续做

### 想到就记，继续手头的事

点击会话顶部右侧的「边记部」按钮，打开右侧面板，记录待办、补充想法或需要回看的细节。入口显示待续数量；拖动便笺左侧的把手即可调整先后。

### 留在工作区，下次接着做

同一个工作区默认共享一份清单。无论从哪个会话打开，看到的都是同一批事项；面板顶部还能在「工作区」与「会话」之间切换，工作区级汇总整个工作区，会话级只看当前会话。工作区之外的会话没有工作区级，始终按会话保存。第一次打开时，成员会话里已经记下的便笺会自动并入工作区清单，不会丢。

### 准备好了，一键带回对话

点击便笺上的「填入」，便笺正文就会追加到当前对话输入框，这条便笺同时归档。你可以继续补充、调整，再决定发送。输入框已有内容时，便笺按换行接在后面；连续填入多条，就会一行一条排好。填入不会自动发送。

### 日常使用的小细节，也准备好了

- **草稿自动保存**：临时关闭面板，再打开接着写；同一工作区的会话共用同一份草稿，切换会话也不用重打。
- **归档后可回看**：待续与归档分区展示，保留创建与归档时间。
- **面板大小可调整**：宽高按需拖动，记住你的习惯。
- **融入 DSH 界面**：跟随明暗主题与 DSH 全部八种官方语言（中文、英语、日语、西班牙语、法语、德语、俄语和巴西葡萄牙语）。
- **跟随 DSH 本地文件持久保存**：便笺写入 `~/.dsh/storages/aside_note.json`，刷新、重启、换浏览器都不丢；同一浏览器的多标签页实时同步；同一 Host 的其他浏览器在打开面板时刷新。设置 › 数据存储会显示文件的完整路径，可拷贝路径或直接在文件管理器中定位。

> 宿主存储可用时，同一 DSH 宿主上的浏览器共享便笺。升级和回落行为见[数据保存在哪里](#数据保存在哪里)。

[查看安装方法](#快速安装) · [反馈问题或建议](https://github.com/LighghtEeloo/dsh-sideby-note/issues)

## 功能

- **工作区级便笺**：同一个工作区默认共享一份清单，切换会话也能接着看；面板顶部可在「工作区 / 会话」之间切换，工作区之外的会话只有会话级。同一浏览器的多个标签页同步更新。
- **入口与面板**：会话顶部右侧的图标按钮用角标显示待续数；空白新会话在右上角出现，首轮对话前只提供工作区清单、不显示「会话」选项；点击打开固定面板并与之对齐，DSH 右侧栏打开时自动左移，切换会话时收起。
- **条目操作**：添加、拖动排序、复制、填入、退回输入框重新编辑；不再手动勾选完成，填入即归档。「清空归档」需要二次确认，归档中的条目可展开回看。退回后清空输入框即等于删除该条。
- **填入**：把便笺正文按纯文本追加到**当前打开的会话**输入框，不自动发送；输入框已有内容时用换行接在后面，连续填入多条就是一行一条。成功后这条便笺移入「归档」。找不到输入框时什么都不改，便笺仍待续。
- **拖动排序**：待续的便笺按左侧把手拖动重排，键盘聚焦把手后用 ↑ / ↓ 逐条移动，拖动中按 Esc 取消；归档便笺按归档时间排列。
- **状态记忆**：新增草稿按工作区自动保存（工作区之外的会话按会话），切换会话或在「工作区 / 会话」之间切换都不会丢；提交时仍写入当前选中的清单。关掉面板再打开会恢复草稿，「待续 / 归档」的展开折叠状态与范围选择也会记住。
- **面板尺寸**：拖左边缘调宽度、拖底部把手调高度，双击复位；宽高都保存在浏览器里。
- **列表分区**：「待续」「归档」各有吸顶标题与独立滚动，展开归档不会压缩待续；每条便笺静置时只显示正文与时间，悬停时时间让位给「复制 / 退回 / 填入」；归档便笺按归档时间倒序。
- **设置**：数据存储（文件路径、复制和定位）与关于（版本、检查更新、作者、改良者、源码）。
- **更新提示**：有新版本时设置按钮出现提示点，设置 › 关于 可查看更新说明并更新；详见[更新提示](#更新提示)。
- **界面融入**：颜色、圆角、阴影与滚动条全部复用 DSH 设计令牌，自动适配明暗主题与 DSH 全部官方语言；详见[设计规范](#设计规范)。

## 功能截图

五个主要状态的实拍，明暗同源（同一演示会话、同一批便笺，只切换主题）：

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
    <td>设置<br>关于</td>
    <td><img src="./docs/assets/features/settings.png" width="300" alt="设置"></td>
    <td><img src="./docs/assets/features/settings-dark.png" width="300" alt="设置（暗色）"></td>
  </tr>
  <tr>
    <td>行操作<br>悬浮显示把手与复制 / 退回 / 填入</td>
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

1. 点击会话顶部右侧的「边记部」按钮，打开右侧面板；有待续条目时，按钮角标显示数量。面板顶部的「工作区 / 会话」用来切换整个工作区与当前会话的清单。
2. 在面板里写一条具体的小事，点击输入框右侧的「＋」或按 Enter 添加。按 Shift+Enter 换行。
3. 需要改一条便笺时，点该条右侧的「退回」，内容回到顶部输入框，改完再提交；退回后清空输入框就删除了这一条。
4. 想调整先后时，按住便笺左侧的把手拖到新位置（或聚焦把手后按 ↑ / ↓）。
5. 需要继续处理时，点该条便笺的「填入」，内容追加到对话输入框、便笺同时归档，确认后自行发送；点「归档」展开回看。
6. 点面板外部或按 Esc 关闭。

## 数据保存在哪里

宿主存储可用时，便笺写入 `$DSH_HOME/storages/aside_note.json`，默认路径为 `~/.dsh/storages/aside_note.json`。DSH 在文件中用两张表保存会话与工作区清单。「设置 › 数据存储」显示实际路径。

- 首次启动先检查宿主。宿主存储为空时，从 `dsh.aside-note` 和 `dsh.aside-note.workspaces` 导入浏览器里的旧便笺，并保留原副本供恢复。宿主已有便笺时，使用宿主清单，原浏览器副本仍可用于恢复。
- 切换前若宿主不可用，本次继续使用浏览器存储，下次启动时重试。切换后若宿主不可用或文件损坏，面板会提示错误，并暂停写入直到宿主恢复。
- 连接同一 DSH 宿主的浏览器共享宿主便笺。跨机器迁移可备份 DSH home 或复制该文件。卸载插件后文件仍留在宿主上。
- 面板尺寸、「待续 / 归档」展开状态及未提交草稿仍存在浏览器。工作区内的会话共用一份草稿，提交时写入当前选中的清单；工作区外的会话各自保存草稿。

边记部沿用旁边记 1.2.0 的宿主文件及格式，可以读取已有的宿主便笺，也兼容浏览器中的旧 `dsh.aside-note.*` 数据。DSH 同一时间只允许一个插件打开这份存储。切换时请先停用正在使用它的插件，边记部遇到占用时会提示并暂停写入。

## 更新提示

打开面板时，插件会静默检查一次 npm 上的最新版本（npmjs 不可用时回退到 npmmirror，再回退到 GitHub 的最新 Release）；结果缓存一小时。若最新版本更高，设置按钮右上角出现提示点，设置 › 关于 中出现更新卡片：

- **检查更新**：立即重新读取 registry，绕过这一小时的缓存；按钮下方会显示「正在检查」「已是最新」或失败状态。
- **更新内容默认展示**：有新版时直接在卡片里列出 GitHub Release 的更新说明，不需要再点开。说明由 Release 正文中 `app-update-notes:zh` / `app-update-notes:en` 标记之间的内容提供，统一压成纯文本渲染，不会执行或注入任何 HTML。
- **跨多个版本**：如果线上版本领先本地好几个版本，说明区会按版本从新到旧逐条列出这段区间内的 Release；最新版本默认展开，更早的版本各自折叠、点标题单独展开。草稿与预发布不参与，最多列出 6 个版本，更多时给出「更早的版本请见完整更新说明」链接。
- **完整更新说明**：链接位于「立即更新」右侧，点击在新标签页打开对应的 GitHub Release 页面。
- **立即更新**：通过宿主自己的更新端点就地覆盖安装，不经过插件市场；完成后提供「刷新页面」，需要重启时会说明。
- **更新方式兜底**：宿主没有更新路由，或拒绝替换正在使用的插件文件时，卡片直接给出带目标版本和 profile 目录的命令，并提供「拷贝更新提示词」——一键复制可直接粘给 agent 的更新指令。预发布还会固定 npmjs registry，避免装回稳定版。

更新始终需要手动点击：面板只负责检查、说明和发起宿主更新，自己不执行任何命令，也从不改动本地便笺。版本检查与说明读取只访问公开的版本号与 Release 正文，不上报任何数据。

发布说明由 `tools/release/notes.mjs` 从 `CHANGELOG.md` 生成：中英文两段，各自带 `app-update-notes` 标记，外加安装链接与 Full Changelog 链接；打 tag 时发布流程会用它创建 Release 并附上 tgz。详见 [发布与版本迭代](./docs/release.md)。

## 开发

浏览器半侧在 `src/client/`，由 tsdown 打包成单个 `client/client.js`：

```bash
npm install
npm run check         # lint + typecheck + 测试 + 构建 + 案例目录校验
npm run build         # 只重新生成 client/client.js
npm run catalog:check # 只校验测试案例目录与测试是否对得上
npm run test:run      # 逐用例执行记录 + report.html/md（.test/runs/）
npm run test:mutate   # 变异测试：确认用例能抓到真实缺陷
```

本地调试时把仓库 link 进 DSH profile（`<path-to-repo>` 换成克隆目录），再在 profile 目录执行 `pnpm install`：

```json
{
  "dependencies": {
    "dsh-sideby-note": "link:<path-to-repo>"
  },
  "dsh": {
    "profile": {
      "bundles": ["dsh-sideby-note"]
    }
  }
}
```

新增插件行后，在侧边栏「插件」页把该组合包关闭再开启，运行中的 Host 会在线重新组合，无需重启。

入口是 `src/client/index.ts`，导出 `apply(ctx)`；tsdown 负责套上 DSH 的加载壳：

```js
window.__ModuleLoader__.load({ id: 'dsh-sideby-note', factory: (require) => { … } })
```

产物单独提交：CI 会重建并对比 `client/`，不一致就失败，因此不要手改 `client/client.js`。

`index.js` 注册宿主更新与便笺存储端点；`cordis.patch.yml` 负责把包插入 profile 的组合。界面依赖 `slots` 与 `locale` 两个服务：

- `conversation.composer.dock`：只用来捕获当前会话 ID，不渲染可见入口。
- 顶部右侧入口由 MutationObserver 注入宿主 header，因为宿主重渲染会回收 React portal。

面板用 `react-dom/client` 的独立 root 挂到 `document.body`，用 fixed 定位跟随入口；所有样式使用 DSH 的 `--dsw-alias-*` 主题变量，自动适配明暗主题。

修改源码后先 `npm run build`；开发模式下 DSH 会热替换新 bundle，否则刷新页面或重启 DSH。

截图与预览图的产出流程见 [截图与预览图 SOP](./docs/screenshot-sop.md)：在隔离 profile 里造演示会话，一条命令重拍明暗两套；凭据默认不复制。

代码结构、数据模型与构建约定见 [架构文档](./docs/architecture.md)；测试工程（规则 / 用例 / 执行记录 / 门禁）见 [测试工程](./docs/testing.md)。

分支模型、版本策略与发版步骤见 [发布与版本迭代](./docs/release.md)。

## 验证

集成测试覆盖以下面板流程：

- 会话顶部右侧出现「边记部」按钮，角标显示待续数；
- 点击按钮在右侧打开面板，面板右上角对齐入口；
- 添加后按钮角标与面板计数同步；
- 面板内可复制、退回输入框重新编辑、清空归档；「填入并归档」与拖动 / 方向键排序由 jsdom 集成测试驱动；
- 刷新页面后记录仍在；面板头部可在工作区级与当前会话级清单之间切换；
- 版本检查的 npmjs → npmmirror → GitHub Release 回退、1 小时缓存与版本比较由契约测试覆盖；发布说明的标记提取、中英文回退、上限与 Markdown 压平有独立测试；jsdom 集成测试会驱动面板显示更新卡片、展开说明并通过宿主更新端点完成一次更新。真实更新提示需先发布到 npm 或创建 GitHub Release。

运行 `npm run check` 可验证 lint、类型检查、构建、自动化测试和用例目录，详见[测试案例目录](./tests/catalog/README.md)。

# 边记部（Sideby Note）架构

面向维护者的结构说明。界面约束见 [面板 UI 规则](./panel-ui-rules.md)，截图流程见 [截图 SOP](./screenshot-sop.md)。

## 1. 形态与运行时契约

边记部的**界面在浏览器半侧，数据在宿主半侧的本地文件**：浏览器拿不到 `$DSH_HOME`，
所以宿主用 DSH 官方存储（`ctx.storageDomain` + JSON 后端）维护 `~/.dsh/storages/aside_note.json`，
浏览器经同源 `fetch` 访问；宿主另外承担浏览器做不到的「把新版本装进 profile」（见 §8）。
`index.ts` 负责注册这两组端点，构建后由 `index.js` 加载。
浏览器的同步读由启动时 hydrate 的内存快照兜住。

- `package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`，`dsh.client` 声明 `./client` 与需要预注入的宿主模块。
- 壳把 `./client`（即 `client/client.js`）当 classic script 加载：`window.__ModuleLoader__.load({ id, factory })`。
  `factory(require)` 里的 `require` 绑定到冻结的模块表，只认 `react`、`react/jsx-runtime`、`react-dom`、
  `react-dom/client`、`@deepseek-ai/dsh-client-ui-primitives`；其余依赖全部内联。
- 样式是 `import css from './styles/panel.css?inline'`，
  由入口在 `apply()` 里插入**一张** `<style data-dsh-plugin="dsh-sideby-note">`，dispose 时移除。
  面板与输入框 dock 不在同一棵 React 树里，所以不能做面板级 `<style>`。
- 浏览器侧用 `slots`（`conversation.composer.dock` 捕获当前会话、`conversation.hero.options` 捕获空白新会话、
  `shell.overlay` 渲染面板与全局 Toast）与 `locale`（注册字典、绑定 `t`，并订阅语言变化让已打开的面板就地换语言）。
  提供 `shortcuts` 服务时，浏览器侧同时注册面板切换命令，由 DSH 管理键位和用户偏好。
  宿主侧使用 `webServer`（路由）、`connection`（校验 Web 请求）与 `storageDomain`（存储领域），
  存储服务缺失时路由返回 503，客户端据此不切换。
- 存储切换是**一次性**的：启动探测宿主 → 可用则迁移后单向使用，不可用则留在 `localStorage` 并提示；
  标记只在成功后写，之后不再回退（见 [上游存储迁移设计 §7](./design/host-storage-migration.md)）。
- 顶部入口是注入宿主 header 的原生 DOM 按钮，不是 React portal——宿主重渲染会回收 portal。

### 原生输入框接入

录入区的设计目标见[原生输入框能力与组件复用](./panel-ui-rules.md#原生输入框能力与组件复用)。
`ComposerForm` 持有面板内的文件选择、粘贴与拖放。
`fileDrag.read()` 解析 Web 应用内的原图拖拽，桌面文件拖放直接读浏览器提供的 `File`。
`shell.overlay` 用 portal 将面板渲染到 `body`，
面板通过 `renderFactorySlot('conversation.images.content', …)` 把授权读取的原图预览 URL 交给宿主。
`AttachmentRail`、`FileCard` 和缩略图回退样式固定版本静态复用。
音视频预览和下载使用便笺的原件接口。

便笺上传用原有字节端点，文件卡独立显示传输进度与失败。
宿主确认原件后，草稿立即保存对应引用，保持文件选择顺序。
未完成和失败的 `File` 由当前页面持有，可跨面板关闭和会话切换恢复，刷新后需重新选取。
保存便笺前处理完所有上传项，包括重试或移除失败项。

「填入」经目标会话的原生粘贴入口交接，核对附件 ID 与正文提交到草稿后的结果再归档。
会话附件栏继续显示上传进度和失败。归档失败在当前标签页保留重试记录，再点只重试归档。
混合写入中断时仅尝试移除本次确认加入的草稿 ID。
DSH `0.2.2-rc.5` 的公开移除方法只更新草稿列表，上传及资源释放由原生附件栏管理。
完整的原子交接仍需要宿主提供成批接收和回滚接口。

同版本的 `requestDraftInitialization({ whenDraftExists: 'append' })` 可保留已有引用和附件，
会在已有尾换行后多加一个段落分隔，并把追加合并到编辑历史。
填入沿用可单独撤销的原生粘贴。`conversation.composer.dock` 提供会话绑定的读写接口。
每个会话的 Lexical 编辑器支持一个可编辑根，复用完整录入区需要可绑定独立便笺草稿的宿主入口。

## 2. 目录

```text
src/client/
├─ index.ts              # apply(ctx)：样式、locale、slot 注册、入口、Toast 座位
├─ constants.ts          # 包身份、存储键、平台相关常量
├─ scope.ts              # 会话 → 工作区绑定；解析查看筛选与新增便笺的工作区
├─ dsh.d.ts              # 宿主 ctx / locale / slots 的最小 ambient 类型
├─ i18n/                 # zh.ts（键的唯一来源）、其余 7 种 DSH 官方语言、index.ts（fill / makeSay）
├─ domain/               # id、clipboard、forward（写入会话输入框）、items（归一化/排序/时间/手排移动）
├─ storage/              # 设备本地：codec（含损坏备份）、merge（本地回落时的并发合并）、drafts、设备级 prefs；
│                        # 宿主：host-client（HTTP）、state（缓存/模式）、boot（探测/迁移）、
│                        # ops（diff 写）、legacy（迁移来源与标记）；workspace/prefs 双介质分发
├─ ui/                   # 面板外壳与纯展示组件、hooks、primitives、定位
│                        # 更新中心：useUpdateCenter（检查/说明/更新与命令兜底）、UpdateNotice
├─ update/               # latest（版本与 Release 探测）、releaseNotes（标记解析）、
│                        # releaseHistory（多版本区间）、
│                        # host（宿主更新端点客户端）
└─ styles/panel.css      # 全局 .dsh-an-* 规则与 --an-* 尺度
index.ts                 # 宿主入口，注册更新、便笺存储和附件端点
host/                    # TypeScript 宿主模块（构建产物与源码同目录）：
                         # route（两个更新端点）、apply-update（三级安装）、profile、versions、exec
                         # store-spec（aside_note 领域与 zod schema）、store（懒打开/快照/原子变更/迁移）、
                         # store-route（GET/POST /dsh-sideby-note/store、GET /store/location、POST /store/reveal）、normalize、http
client/client.js         # tsdown 生成的浏览器产物
index.js                 # tsc 生成的宿主入口
scripts/install.mts      # npm 安装器源码，编译为 scripts/install.mjs
cordis.patch.yml         # profile 组合里的一行
tests/                   # catalog/（业务规则与用例）、*.test.mts（契约 / 集成 / 韧性）、testkit/（jsdom 启动器）
tools/screenshots/       # 截图流水线（见 screenshot-sop.md）
docs/assets/             # README 截图（preview-* 与 features/）
```

## 3. 模块职责

| 层 | 模块 | 职责 |
| --- | --- | --- |
| 入口 | `index.ts` | 注入样式 → 注册字典 → 座位入口/Toast/slot |
| 身份 | `constants.ts` | 包与插件的 id、`dsh-an-*` 相关的键与上限 |
| 文案 | `i18n/` | `zh.ts` 定义键集合与 `MessageKey`；其余 7 种 DSH 官方语言用 `Record<MessageKey, string>`，缺键编译失败；运行时未知语言或缺键一律回退英文 |
| 领域 | `domain/items.ts` | `normalizeItems`（防御性清洗、去重）、归档排序、`moveOpenItem`（只重排待续，归档留在原槽位）、相对时间文案 |
| 领域 | `domain/forward.ts` | 确定目标会话，经原生粘贴交接有序附件与正文，并核对提交到草稿后的结果 |
| 存储 | `storage/draftUploads.ts` | 按草稿跟踪上传状态和顺序，逐个保存成功的原件引用 |
| 存储 | `storage/workspace.ts` | 读写各工作区清单，供面板筛选和汇总。宿主写入使用 `list.patch` diff，本地写入先合并并发变更 |
| 存储 | `storage/merge.ts` | 本地回落模式的按 id 合并：双方新增都保留，同一条目取较新的 `updatedAt`，本页相对上次读取删除的条目不再复活 |
| 存储 | `storage/boot.ts` | 启动探测、一次性迁移、模式标记与提示；不可用不切换，成功后单向 host |
| 存储 | `storage/state.ts` / `host-client.ts` / `ops.ts` | 内存快照、同标签广播、同源 HTTP、按 key 串行与乐观/回滚策略 |
| 存储 | `storage/legacy.ts` | 旧 `localStorage` 快照（迁移来源）、兼容上游的 `dsh.aside-note.storage-mode` 切换标记与 `dsh.aside-note.storage-notice` 提示去重 |
| 范围 | `scope.ts` | 解析当前会话的工作区归属，区分列表筛选和新增便笺的写入目标 |
| 更新 | `update/latest.ts` | npm → npmmirror → GitHub Release 的版本探测（1 小时缓存），按版本读取 Release 正文 |
| 更新 | `update/releaseNotes.ts` | 提取 `app-update-notes` 标记块、按语言回退、压平 Markdown、上限兜底 |
| 更新 | `update/releaseHistory.ts` | 从 releases feed 选出「本地 < 版本 ≤ 最新」的区间，剔除草稿/预发布，倒序与上限 |
| 更新 | `ui/useUpdateCenter.ts` | 自动/手动检查、懒加载说明、更新状态机（starting/running/done/error）；只走宿主更新端点，没有市场分支 |
| 更新 | `ui/UpdateNotice.ts` | 页脚「有新版本」展开后的内容：说明、完整说明链接、立即更新与刷新，宿主没有路由或拒绝时提供带版本号的命令与拷贝更新提示词 |
| 存储 | `storage/prefs.ts` | 筛选选择在宿主模式写入 `global`，面板宽高与分区状态留在设备本地 |
| UI 组件 | `ui/MemoPopover.ts` | 组合面板 hook 与组件，由 `shell.overlay` 中的 React portal 渲染 |
| UI 组件 | `PanelHead` / `ScopeSwitch` / `ComposerForm` / `NoteList` / `ClearConfirm` / `TodoRow` / `EmptyState` | 纯展示，数据与回调由面板传入 |
| UI 组件 | `PanelFooter` / `StorageDetails` | 页脚「存储与更新」默认折叠，展开后显示存储状态并读取宿主文件路径。有新版时显示独立的「有新版本」入口 |
| UI hooks | `useSessionMemoStore` / `usePanelGeometry` / `useSections` / `useComposerDraft` / `useNoteActions` / `useRowReorder` / `useClearConfirm` / `useListEdge` / `useOutsideDismiss` | 把状态与副作用从 JSX 里分离；每个 hook 只做一件事 |
| UI 基础设施 | `primitives` / `position` / `toastSeat` / `headerEntry` | 共享图标与 Tooltip、浮层定位与吸顶、跨面板 Toast、宿主 header 入口（空白新会话回落到 header corner） |

约定：`domain/` 与 `storage/` 不 import React；需要 React 的状态放 `ui/use*.ts`。
浏览器半侧不碰 Node 内置模块与 `process`（契约测试会拦）。

## 4. 数据模型

便笺以 DSH 官方存储的领域写进宿主的 **`$DSH_HOME/storages/aside_note.json`**（`single` 布局，整文件原子替换）：

```json
{
  "unit": { "name": "aside_note", "version": 1 },
  "global": { "version": 1, "sidebyNoteScopeMode": "workspace", "sendShortcut": "enter", "forwardPrefix": "…" },
  "tables": {
    "sessions": {},
    "workspaces": { "<workspaceId>": { "workspaceId": "…", "updatedAt": 0, "items": [], "seededSessionIds": [] } },
    "forwarded": { "ws:<workspaceId>": { "<itemId>": true } }
  }
}
```

- `workspaces` 存放所有当前便笺，包含专用的未分配工作区 `sideby-note:unassigned`。
  宿主格式保留 `sessions` 表的 schema 来读取旧会话记录，迁移成功后该表为空。
- `global` 存筛选偏好与迁移标记。
  上游的 `scopeMode`、`sendShortcut`、`forwardPrefix` 与 `forwarded` 表保留在宿主格式中，供换回上游时继续使用。
  边记部界面按自己的快捷键与归档规则运行。
- 浏览器在宿主之外仍保留设备本地状态（`localStorage`）：面板宽高、分区展开、首次打开标记、
  未提交草稿（`dsh.aside-note.drafts`，按工作区/会话共享）。
- 领域 `version` 是当前格式版本；读旧版本要配 `compatibleVersions`，删字段前必须重写所有记录（官方无值迁移 runner）。
- 展开页脚「存储与更新」后，通过 `GET /store/location` 读取该文件的完整路径，可复制路径。
  `POST /store/reveal` 让宿主在文件管理器中定位它。
  后端不是 JSON 文件时明确显示「无法定位」，不猜路径。
- `Note` 形如 `{ id, text, done, createdAt, updatedAt, completedAt? }`；`text` 上限 280，
  **清单条数不设上限**（400 条仍可展示与新增，见 `STORE-018`）。
- 每次写入整文件替换；数据量远小于文件系统压力，写入排队由领域写链串行化。

### 工作区归属与筛选

「全局」汇总所有工作区清单，包括未分配工作区。「工作区」只显示当前绑定的工作区，绑定后即可选择。
两个筛选下新增便笺都写入当前工作区，会话独立于工作区时写入专用的未分配工作区。
全局列表中的行保留所属工作区，归档、退回及重新提交等操作都写回该工作区。
同一条 id 可出现在不同工作区，相应行通过工作区和便笺 id 一起定位。

### 旧会话便笺迁移

迁移用 DSH 的完整工作区成员关系解析旧会话记录，包含当前面板以外的会话和工作区。
拿到完整成员关系后，将其中找不到归属的记录移入未分配工作区。

每个目标工作区按便笺 id 合并，同一工作区内 id 重复时保留工作区已有版本，旧记录中其余便笺也一并保留。
迁移会检查旧版仅复制便笺时已记录在 `seededSessionIds` 中的会话，找出旧记录独有的便笺。
确认目标工作区已持久化合并后的便笺，才删除对应的旧会话记录。
若在两步之间中断，重试按同一工作区内的 id 合并。

### 浏览器与宿主存储切换

**切换状态机**（[上游存储迁移设计 §7](./design/host-storage-migration.md)）：

| 状态 | 触发 | 行为 |
| --- | --- | --- |
| 未切换 | 宿主可用且为空 | 有浏览器旧数据则执行两阶段 `migrate`，成功后写浏览器切换标记 |
| 未切换 | 宿主可用且非空 | 写标记，不迁移；本地旧数据保留并提示 |
| 未切换 | 宿主不可用 | 留在 `localStorage`，提示一次（24h 去重），下次启动重试，不写标记 |
| 已切换 | 宿主可用 | 正常读写 |
| 已切换 | 宿主不可用 | 错误态，只读本次快照或空清单，暂停写入，面板内显示原因与「重新连接」 |
| 任意 | `aside_note` 已由另一个插件打开 | 提示停用占用插件后重试，暂停写入，避免产生两份清单 |

两个插件沿用同一宿主存储格式。DSH 在一个进程中只允许一个插件持有该存储领域，所以切换插件时先停用当前使用者。

**本地回落模式**（尚未切换或宿主不可用时的 `localStorage` 路径）：

- `dsh.aside-note`、`.workspaces`、`.drafts` 读取前先校验；解析失败或字段类型不对，
  原始字符串先写到 `<键>.corrupt`（同一键只保留最后一份损坏内容），再把该键当作空清单继续，下一次写入不会静默覆盖证据。
- `writeWorkspaceRecord` 先读回最新工作区记录，再按 id 合并（`storage/merge.ts`）。
  两个标签页同时记便笺时双方新增都保留；同一条目冲突取 `updatedAt` 较新的一方；
  本页相对上次读取删除的条目不被并发写入复活（反向可能复活，宁可复活不丢）。
- 本地存储按浏览器 origin 隔离：桌面端与 `http://127.0.0.1:<port>` 是不同 origin 的两份数据；
  仅当整站存储被拒绝时 `storage()` 才返回 `null`，更常见的是写失败（配额/磁盘/profile 只读）返回 `false`。
  迁移到宿主后这一层只作为回退与恢复来源。

草稿按 `draftKey` 存放：会话属于工作区时，整个工作区共用一份新增草稿，切换会话或列表筛选时保留草稿。
没有工作区的会话按会话保存草稿，提交新增便笺时写入未分配工作区。
升级后首次打开工作区，会把当前会话的旧草稿并入共享键并清理成员会话的旧副本。

面板里只有顶部一个编辑区。「退回」把便笺从所属清单移回录入区，带回正文与附件，桌面端自动聚焦。
提交后重新加入原工作区。录入区已有内容时提示先处理当前草稿。
录入框按 Enter 添加便笺，按 Shift+Enter 换行，输入法选词时的 Enter 交给输入法。

「填入」把原始附件追加到当前会话草稿，并在已有正文之后另起一行追加便笺正文。
纯附件便笺也使用这条路径。附件先完整读取，再由 DSH 校验整批文件。
读文件失败、输入框不可用或拒收附件时，便笺保持待续。
草稿接收正文和全部附件后，便笺在所属工作区归档（`done: true` 与 `completedAt`）。
各工作区的待续顺序由各自的存储数组决定。
`useRowReorder` 处理指针拖动与 ↑ / ↓ 键，移动范围限于该便笺所属工作区。
拖动期间只改行的内联 `transform`，松手才经 `moveOpenItem` 写入一次，再在 layout effect 里把被拖行从松手处滑入新位置。

## 5. 构建与产物

- `tsc` 按 `tsconfig.host.json` 校验宿主源码并就地生成 ESM 的 `index.js` 和 `host/*.js`。
  `.js` 相对导入在类型检查时解析到 TypeScript 文件，在 npm 包内解析到同名 JavaScript 模块。
- `tsdown.config.ts` 用 rolldown 打包客户端源码，产物为单个 `client/client.js`，
  沿用 CJS closure factory、`target: es2022`、无压缩和无 sourcemap 的设置。
  CSS 由 `?inline` 虚拟模块载入，虚拟 id 使用相对路径。
- `tsc` 按 `tsconfig.install.json` 把 `scripts/install.mts` 编译为 `scripts/install.mjs`。
  构建保留 `#!/usr/bin/env node`，并把产物设为可执行的 npm bin。
- Git 记录源码与构建配置。npm 包发布全部运行文件，并保留原包内的三份宿主 TypeScript 文件。
- Node 按 `engines.node` 的版本范围直接执行维护脚本和 `.test.mts` 测试。
  `tsconfig.tools.json` 单独检查发布、用例目录与截图工具的类型。
- 版本号在 `src/client/constants.ts`，契约测试保证与 `package.json` 一致。
- `npm run check` 串起 lint、typecheck、构建、测试与用例校验，`typecheck` 同时覆盖 `tsdown.config.ts`。
  `npm ci`、`npm pack` 和 `npm publish` 通过 `prepare` 构建。
  CI 门禁见 [测试工程](./testing.md#3-门禁)。

## 6. 测试

| 文件 | 覆盖 |
| --- | --- |
| `tests/catalog/design.yaml` | 业务规则与不变量（用例的唯一设计来源），字段见 [测试工程](./testing.md) |
| `tests/catalog/*.yaml` | 测试用例目录：稳定 ID、优先级、规则引用、自动化指针 |
| `tests/contract.test.mts` | 清单与 patch 形状、工具链约定、样式令牌、无障碍与交互规则、字典完整性 |
| `tests/resilience.test.mts` | 排序与取消操作、独立和空白会话的筛选、存储读写失败、跨标签页刷新、宽度钳制、确认失效、未知语言回落、大清单 |
| `tests/testkit/bundle.mts` | 在 jsdom 里启动构建产物的测试装置：可注入存储故障、压缩定时器、locale 与 slot props |
| `tests/bundle.test.mts` | 在 jsdom 里执行**构建产物**：模块表、slot 注册、样式注入、入口注入，并驱动完整面板流程（添加、页脚入口、方向键排序、填入并归档与找不到输入框时不变、清除确认、退回输入框、缩放、清空到空态、分区记忆）；工作区与空白会话测试涵盖共享清单、全局与工作区筛选、便笺归属和入口位置 |
| `tests/host-store.test.mts` | 宿主 store 契约：快照、diff/顺序/删除、并发新增保留、工作区归属迁移、偏好、宿主导入与中断恢复、不可用/损坏错误码、路由鉴权与体积上限 |
| `tests/host-bundle.test.mts` | 构建产物 + 假宿主端点：首次迁移后只写宿主、不可用时留在浏览器、已切换后不可用进入错误态且不写 `localStorage` |

契约测试按模块读取源码（需要时读 bundle 或 CSS），断言的是约束而不是实现细节；集成测试提供行为兜底。

## 7. 扩展时先看这里

- 新增文案：改 `src/client/i18n/*.ts` 的 8 种语言，键与占位符必须一致；插件列表文案同步改 `locale/*.json`；
  中文提示不加句号。
- 新增便笺字段（宿主数据）：`host/store-spec.ts` 扩 zod schema（必要时升 `version` 并声明 `compatibleVersions`）→
  `host/store.ts`/`host/normalize.ts` 处理 → 浏览器 `storage/` 模块 → 补宿主与集成测试。
- 新增设备状态：`constants.ts` 加键 → `storage/prefs.ts`/`drafts.ts` 读写 → 补契约测试；不要放进宿主领域。
- 新增面板状态：优先放 `ui/use*.ts`；纯逻辑放 `domain/`，不要 import React。
- 改样式：只动 `src/client/styles/panel.css`，遵守 [面板 UI 规则](./panel-ui-rules.md)（语义别名、三档字号、
  0.5px 发丝线、hover 门控）。
- 改完源码后用 `npm run build` 更新运行文件，并提交改动的源码。

## 8. 更新路径

自 1.1.2 起，更新走**宿主**，不走插件市场。市场的更新是「先移除 bundle 再安装」，
而运行中的 Desktop 拒绝移除正被 fiber 使用的插件（`bundle-in-use`）——面板打开时它永远处于这个状态。
宿主改为就地覆盖，三级降级：

1. `pluginManager.installBundle('@miorin/dsh-sideby-note@<v>', { enabled: false })`（`enabled: false` 表示只换包，
   不动 profile 的 bundle 选择）
2. 若被拒为 `already-installed`：`dsh plugin add <spec> --save-exact`
3. 仍不可用：用该 profile 自带的包管理器 `add <spec> --save-exact`

装完回读 `node_modules/@miorin/dsh-sideby-note/package.json`，必须等于目标版本，否则报 `RESOLVED_VERSION_MISMATCH`。
成功返回 `restartRequired: true`——DSH 不重载已加载的包，新版本在下次启动生效。

更新有两个同源端点，请求须通过 DSH 会话校验，写入使用 POST：`GET /dsh-sideby-note/update/probe`、
`POST /dsh-sideby-note/update/apply`（body `{ target }`）。
`link:` 安装会被直接拒绝：覆盖 checkout 的依赖声明等于把工作副本悄悄换成 registry 版本。

自 1.1.2-beta.7 起，客户端不再保留插件市场客户端或探测：宿主没有路由、
或拒绝码属于「终端命令能绕过」的一类时，卡片直接给出手动命令。
命令由宿主生成，带目标版本与 profile 目录；预发布还会固定 `npx` 的 npmjs registry，避免装回稳定版。

包名切换由显式执行的安装器完成。它备份目标 profile 的 manifest 与 lockfile，替换旧依赖与组合包条目；
Cordis 行 id 沿用 `dsh-sideby-note`，按行 id 匹配的自定义 patch 继续生效。
若自定义 patch 还用旧包名限定匹配，需把其中的 `name` 改为 scoped 包名。

### 为何不查「有 agent 正在运行」

DSH 插件市场在更新前会拒绝 `runningAgentsForGuard()` 非空的请求（除非显式 `confirmAgentsRunning`）。
**本插件的更新端点刻意不做这项检查**，理由：

- 便笺是纯 UI：agent 不 import 本包的任何文件；宿主半边只是更新与存储端点及一个存储领域，且随宿主启动就已在内存里。
  替换包文件不改变 agent 正在执行的代码。
- 反过来，把「更新一个界面插件」挡在「别的 agent 正在跑」后面，会让用户在等待时无法升级，成本大于收益。

所以这是**有意的行为差异，不是漏检**。
审查时看到 apply 里没有 `agents` 判断，请先读本节，不要直接补检查。

**需要重新评估的条件**：一旦本包出现 agent 会加载的东西——tools、skills、agent 侧 provider，
或宿主半边开始被 agent 调用——就必须补上与市场一致的守卫（含 `confirmAgentsRunning` 逃生阀），
并让 `useUpdateCenter` 把该拒绝码交给 `UpdateNotice` 的命令兜底路径。

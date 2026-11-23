# AGENTS.local

本文件补充 [AGENTS.md](AGENTS.md)，记录边记部（Sideby Note）的项目约定。
与通用规则冲突时以本文件为准。维护文档入口见 [docs/README.md](docs/README.md)。

## 文档职责与语言

- [README.md](README.md) 是中文用户文档，[README.en.md](README.en.md) 是英文版。
  两份都说明安装、使用与数据保存范围。
- 插件详情页要整体短、每项一眼能懂。
  只展示用户当下需要知道或操作的内容，细节按需展开。
- [架构文档](docs/architecture.md)记录运行时契约、数据模型与构建。
  [面板 UI 规则](docs/panel-ui-rules.md)记录录入区的原生输入框能力目标、组件复用与界面约束。
  维护文档沿用中文。
- [发布手册](docs/release.md)、
  [本机实装与验收 SOP](docs/auto-test-sop.md)和[截图 SOP](docs/screenshot-sop.md)分别维护发布、实装验收和截图步骤。
- 用户可见变化写入 [CHANGELOG.md](CHANGELOG.md) 的 `## next-released`，由它生成发布说明。
  文档结构、截图与基建变化写入 [CHANGELOG-OPS.md](CHANGELOG-OPS.md) 的同名小节。

## 结构与命名

- 公开 npm 包与 npm 更新通道使用 `@miorin/dsh-sideby-note`，Cordis 行 id 与 CLI 命令使用 `dsh-sideby-note`。
  界面名称为「边记部 / Sideby Note」。
  保留上游的 `dsh.aside-note` 存储键及兼容格式，具体契约见架构文档。
- 本插件可以独立安装、启用与停用。`index.ts` 与 `host/` 中的 TypeScript 源码承载宿主存储和更新端点。
  便笺优先保存在与上游共用的宿主 `aside_note` 领域，草稿和面板布局留在浏览器。
- 客户端源码在 `src/client/`。
  `npm run build` 生成 `index.js`、`host/*.js`、`client/client.js` 和 npm 安装器 `scripts/install.mjs`。
  维护脚本与测试直接用 `engines.node` 所支持的 Node 运行 `.mts` 源码，安装器用 `tsc` 编译并以原路径发布。
  Git 记录源码与配置，CI 核对 npm 包包含全部运行文件，且连续打包得到同一份内容。
- `locale/*.json` 提供插件列表文案，`src/client/i18n/` 提供界面文案。
  更新各自的全部八种 DSH 语言，保持界面字典的键与占位符一致。

## 复用 DSH 原生界面

录入区的设计基准见[原生输入框能力与组件复用](docs/panel-ui-rules.md#原生输入框能力与组件复用)。

- 优先复用 DSH 原生组件、行为、主题 token 和同类界面布局，以减少自写代码和维护成本。
- 当前版本有受支持的运行时入口且性能可接受时，优先通过公开插槽、
  组件工厂或宿主提供的可加载模块动态复用，让宿主提供组件实现。
  只有现有组件和扩展点无法满足需求时，才补足必要的插件实现。
- 静态引入或打包官方代码或资源时，在引用处标注上游包名、版本或提交、源码路径及符号名，便于升级时回看和同步，
  并保留适用的许可证与署名。

## 开发约束

- 常见操作按钮优先使用易识别的图标，仅在图标无法明确表达操作含义时使用可见文字。
- 编写插件时，除非有特殊说明，否则使用 TypeScript。
  复用与目标 DSH 版本匹配的官方类型，在接口、配置和事件中保留类型信息，对未知输入先校验再收窄，并同步维护类型依赖。
- 新实现只使用 DSH 支持的插件 API 和扩展点。
  禁止修改 DSH 源码或安装产物，也禁止用全局猴子补丁或覆写内部实现绕过边界。
  扩展点不足时说明缺口，并将实现限制在插件能力内。

## 验证与发布

- 本地交付按[本机实装与验收 SOP](docs/auto-test-sop.md)先备份现有数据，再构建并更新当前 profile 里的已有边记部条目。
  本地实装只复用现有 bundle 和安装来源，并在现用 GUI 验收。
  若源码接入现用 profile，备份须先于构建。
- 运行 `npm run check`（lint、类型检查、构建、`tests/` 下的契约与集成测试）。
  源码依赖安装、`npm test` 和打包均会重建 Host 与 Client。
- 在工作区根目录运行 `node tools/new-dsh-plugin/cli.mts --check plugins/dsh-sideby-note` 检查骨架。
- 发版时用 `npm pack --dry-run` 检查发布包内容，并按截图 SOP 重拍。
  验收记录分别写明自动化检查、安装校验和实际界面观察。
- 版本、标签与发布说明遵循发布手册。
  调整主版本需经用户同意。

## Markdown

- 手工维护中英文 README 的排版。
  其余文档可在项目根目录用 `docs/scripts/reflow md <path>` 重排，需要 Python 3.11 或更新版本。
- 在项目根运行 `prek install` 后，钩子会重排符合条件的暂存 Markdown，跳过两份 README 和通用 `AGENTS.md`。
- 在 DSH 沙箱内提交时，用 `PREK_HOME="${TMPDIR:?}/prek-dsh" git commit -m "<commit message>"`，
  让 reflow 钩子照常运行，并把 `prek` 的缓存和日志写到可写的临时目录。

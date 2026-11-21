# AGENTS.local

本文件补充 [AGENTS.md](AGENTS.md)，记录边记部（Sideby Note）的项目约定。
与通用规则冲突时以本文件为准。维护文档入口见 [docs/README.md](docs/README.md)。

## 文档职责与语言

- [README.md](README.md) 是中文用户文档，[README.en.md](README.en.md) 是英文版。
  两份都说明安装、使用与数据保存范围。
- [架构文档](docs/architecture.md)记录运行时契约、数据模型与构建，[面板 UI 规则](docs/panel-ui-rules.md)记录界面约束。
  维护文档沿用中文。
- [发布手册](docs/release.md)、[自动化验收 SOP](docs/auto-test-sop.md)和[截图 SOP](docs/screenshot-sop.md)分别维护发布、
  验收和截图步骤。
- 用户可见变化写入 [CHANGELOG.md](CHANGELOG.md) 的 `## next-released`，由它生成发布说明。
  文档结构、截图与基建变化写入 [CHANGELOG-OPS.md](CHANGELOG-OPS.md) 的同名小节。

## 结构与命名

- 公开 npm 包、插件 id 和更新通道统一为 `dsh-sideby-note`。
  界面名称为「边记部 / Sideby Note」。
  保留上游的 `dsh.aside-note` 存储键及兼容格式，具体契约见架构文档。
- 本插件可以独立安装、启用与停用。`index.js` 与 `host/` 承载宿主存储和更新端点。
  便笺优先保存在与上游共用的宿主 `aside_note` 领域，草稿和面板布局留在浏览器。
- 客户端源码在 `src/client/`，用 `npm run build` 生成 `client/client.js`。
  产物随对应源码提交，CI 会逐字节对照。
- `locale/*.json` 提供插件列表文案，`src/client/i18n/` 提供界面文案。
  更新各自的全部八种 DSH 语言，保持界面字典的键与占位符一致。

## 验证与发布

- 运行 `npm run check`（lint、类型检查、构建、`tests/` 下的契约与集成测试）。
  用 `npm pack --dry-run` 检查包内容，打包时 `prepack` 会重建客户端产物。
- 在工作区根目录运行 `node tools/new-dsh-plugin/cli.mjs --check plugins/dsh-sideby-note` 检查骨架。
- 交付验收与发版前按自动化验收 SOP 使用独立工作树和隔离 DSH profile，保持现用 profile 与凭据独立。
  界面改动用打包后的 tgz 做实机冒烟，发版前按截图 SOP 重拍。
  报告中区分自动化测试和实际界面观察。
- 版本、标签与发布说明遵循发布手册。
  调整主版本需经用户同意。

## Markdown

- 手工维护中英文 README 的排版。
  其余文档可在项目根目录用 `docs/scripts/reflow md <path>` 重排，需要 Python 3.11 或更新版本。
- 在项目根运行 `prek install` 后，钩子会重排符合条件的暂存 Markdown，跳过两份 README 和通用 `AGENTS.md`。
- 在 DSH 沙箱内提交时，用 `PREK_HOME="${TMPDIR:?}/prek-dsh" git commit -m "<commit message>"`，
  让 reflow 钩子照常运行，并把 `prek` 的缓存和日志写到可写的临时目录。

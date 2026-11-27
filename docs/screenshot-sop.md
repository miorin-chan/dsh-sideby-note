# 边记部（Sideby Note）截图与预览图 SOP

README、市场和详情页现用的截图位于 `docs/assets/screenshots/`。
从默认工作区根目录运行 `node tools/dsh-plugin-shots/cli.mts --pilot sideby-note` 重拍。
逐张检查后，把本次输出中的 `main-light.png`、`main-dark.png`、`entry-light.png` 和 `entry-dark.png` 复制到该目录。
共用工具使用隔离的 DSH 环境和演示数据，不读取现用 profile。

发版时，把新图提交到打标签之前，便于从版本标签看到对应的界面。
仅为已发行版本补图时不移动旧标签。

## 旧版整窗与多状态图库

下文记录旧版图库的独立拍摄流程。其输出不再用于 README、市场截图清单或 DSH 详情页。

配套脚本在 [`tools/screenshots/`](../tools/screenshots/)：

| 文件 | 作用 |
| --- | --- |
| `run.sh` | 端到端编排（macOS）：建 profile → 起服务 → 起 Chrome → 拍明暗（功能图 + 预览图）→ 裁切 |
| `run.ps1` | 同一编排的 Windows 版本；用 CDP 固定内容区，不依赖窗口尺寸 |
| `bootstrap.mts` | 造演示会话：一条提问 + 固定四条便笺（含归档状态与时间） |
| `capture.mts` | 逐个状态截图，输出原始 4x PNG 与每个面板的 `rect`；`PREVIEW=1` 时改拍整窗与头部条 |
| `crop.py` | 按 `rect` 外扩裁切、缩放，写 `docs/assets/features/`；`--preview` 缩放整窗、裁入口特写，写 `docs/assets/` |
| `lib/cdp.mts` | 极简 CDP 驱动（无第三方依赖） |
| `lib/notes.mts` | 演示便笺的文案、归档状态与时间年龄，唯一数据源 |

## 1. 产物

| 文件 | 内容 | 尺寸 |
| --- | --- | --- |
| `docs/assets/preview-right.png` / `-dark.png` | 整窗总览：顶部入口 + 右侧面板 | 1920×1200 |
| `docs/assets/preview-badge.png` / `-dark.png` | 入口按钮特写，带待续数 | 920×352（README 按 460 宽显示） |
| `docs/assets/features/{panel,settings,actions,clear,empty}.png` | 功能图（明色） | 1080 宽 |
| `docs/assets/features/{…}-dark.png` | 功能图（暗色） | 1080 宽 |
| `docs/assets/storefront-icon.svg` → `icon.png` | 市场卡片图标（卡片里按 16px 圆形裁切） | 180×180 |

> 一次 `run.sh` 重写全部 14 张图：10 张功能图 + 4 张预览图（`preview-right*`、`preview-badge*`）。预览图由 `capture.mts` 的 `PREVIEW=1` 分支拍整窗与头部条，再由 `crop.py --preview` 缩放、裁切，构图见第 6 节。旧的 `preview.png` / `preview-dark.png`（面板特写商店素材）已下线，不再产出。

> 市场图标不在 `run.sh` 里：它是仓库根目录的 `icon.png`，由 `docs/assets/storefront-icon.svg` 按 540px 渲染后缩到 180×180（插件市场只收 GitHub 上的位图）。`icon.svg` 仍是插件自身的界面图标，两者不要混用。

## 2. 前置条件

- macOS 或 Windows（Windows 需 PowerShell 7+，即 `pwsh`），已安装 DeepSeek Harness（默认路径见下）与 Google Chrome；
- `package.json` 的 `engines` 所支持的 Node 版本及 npm；
- Python 3 + Pillow（Windows 上可指向 DSH 自带的 Python，见 `PYTHON`）；
- 可选：`~/.dsh/.credentials.yaml`。
  **默认不复制**；只有设置 `COPY_CREDENTIALS=1` 时才会复制到临时 profile，用于让演示会话产生一段真实回复。
  缺失或未开启时面板照常可拍，只是回复为空。

可覆盖的环境变量：

```bash
DSH_CLI=/path/to/dsh        # 默认 /Applications/…/dsh；Windows 默认 D:\ProgramFiles\dsh\resources\runtime\cli\bin\dsh.cmd
CHROME=/path/to/Chrome      # 默认 macOS .app 内的可执行文件；Windows 默认 Program Files\Google\Chrome\Application\chrome.exe
PORT=61399 CDP_PORT=9222    # 默认端口
WORK=/tmp/screenshots       # 默认 <repo>/.screenshots，结束时删除
KEEP=1                      # 保留 WORK 便于排查
COPY_CREDENTIALS=1          # 复制本机凭据到临时 profile（默认关闭）
SHOT_VIEWPORT=1440x900@4    # run.ps1 默认设置：用 CDP 固定内容区与 DPR
PYTHON=/path/to/python      # 仅 run.ps1：默认依次试 PATH 上的 python、py 与 DSH 自带运行时，取第一个能 import PIL 的
```

## 3. 一键运行

建议在**独立 worktree** 里执行，避免与主工作树里正在进行的改动互相覆盖：

```bash
git worktree add ../dsh-sideby-note-shots -b chore/shots
cd ../dsh-sideby-note-shots
npm ci
tools/screenshots/run.sh        # macOS
# Windows: $env:COPY_CREDENTIALS = 1; tools/screenshots/run.ps1
npm test
```

`run.sh` 与 `run.ps1` 先执行 `npm run build`，让 `link:` 挂载读取当前源码生成的运行文件。
构建成功后按以下顺序执行。

1. 在 `$WORK` 下新建一个一次性 `DSH_HOME`，用发行版自带模板生成 `demo` profile；
2. 把当前仓库以 `link:` 装进该 profile，`--offline` 安装，
   store 指向 `$WORK/pnpm-store`（**不会**在仓库里留下 `.pnpm-store`）；
3. 写入 `locale.preference=zh`、`ui-theme.preference=light` 与 `welcomeNoticeVersion`；
   仅在 `COPY_CREDENTIALS=1` 时复制凭据；
4. 起 `dsh --profile demo --no-open --port $PORT`，从日志里取 `token`（只保存在变量里，不打印）；
5. 起 headless Chrome（CDP）并固定内容区 1440×900、`deviceScaleFactor=4`（输出 5760×3600，
   给 1080 宽功能图与 1920 宽整窗图留足细节）。
   macOS 用 `--window-size=1440,1043` + `--force-device-scale-factor=4`；
   Windows 上 headless 的内容区会被窗口边框吃掉 8 像素，所以 `run.ps1` 另设 `SHOT_VIEWPORT=1440x900@4`，
   由 `lib/cdp.mts` 调 `Emulation.setDeviceMetricsOverride` 精确对齐，`crop.py` 的 4x 常量无需改动；
6. `bootstrap.mts` 造会话与便笺（便笺写进工作区清单，见第 4 节），并把便笺时间回拨到固定年龄；
7. `capture.mts` 拍明色 5 个状态，再以 `PREVIEW=1` 拍整窗与头部条；
8. 改 `preference: dark` 重启服务、重新取 token，同样拍暗色功能图与预览图；
9. `crop.py` 裁切功能图、`crop.py --preview` 缩放整窗并裁入口特写，写入 `docs/assets/features/` 与 `docs/assets/`；
10. 退出时杀掉服务与 Chrome，删除 `$WORK`（`KEEP=1` 时保留）。

> `run.sh` / `run.ps1` 会在临时 profile 的 `cordis.patch.yml` 里固定 `locale.preference: zh`，让截图始终是中文界面，不随执行者的浏览器语言变化；这样重新生成的功能图与预览图才能和现有 README 保持一致的文案与排版。

## 4. 截图状态矩阵

| 状态 | 触发方式 | 面板高度 |
| --- | --- | --- |
| `panel` | 打开面板，展开「待续」「归档」，列表滚到顶 | 415 |
| `settings` | 折叠两个分区，展开页脚「存储与更新」，等待宿主文件路径出现 | 随内容 |
| `actions` | 鼠标移到第一条便笺上，显示左侧填入和右侧复制 / 退回 | 415 |
| `clear` | 点「清空归档」，出现二次确认条 | 468 |
| `empty` | 临时清空两个便笺 store（会话 + 工作区）并刷新，打开面板 | 381 |

`settings` 沿用原有文件名，方便原地更新 README 和市场已引用的图片。
新图拍的是页脚「存储与更新」。重拍后同步更新两份 README 的预览说明、功能图说明与这一行的标题和替代文本。

演示便笺由 `bootstrap.mts` 写入宿主的工作区清单。
面板默认停在**工作区**，范围由标题下方的「工作区 / 会话」切换显示。
`lib/notes.mts` 通过宿主路由重锚时间，拍空状态时暂时清空演示便笺，拍完原样恢复。

明暗两轮必须**用同一批便笺、同一组时间**，否则两张图并排会露馅。
`lib/notes.mts` 的 `NOTES` 是唯一数据源，改内容只改这一处；`capture.mts` 在拍每个主题前用同一份计划**重新锚定时间**，
所以暗色不会因为晚跑一分钟就变成「47 分钟前」。

## 5. 构图规则（别跳过）

1. **隔离背景**：截图前把 `document.body` 里除 `.dsh-an-popover` 以外的子节点全部 `visibility:hidden`，
   再把 `body` 背景刷成中性画布——明色 `#F2F3F5`、暗色 `#0D0D0F`。
   这样面板的真实阴影和发丝线才不会被对话文字污染。
2. **外扩裁切**：面板 `border:0`，0.5px 描边与阴影画在矩形**外面**。
   必须按 `rect` 向外扩 **26 CSS px** 再裁，否则白面板贴在白底上会「没有边」。
3. **统一宽度**：功能图缩放到 1080 宽（4x 拍摄、约 3 倍面板宽度，放大也不糊）。
4. **去焦点环**：截图前 `document.activeElement?.blur()`，否则录入框会带蓝色 focus 边框。
5. **真实 UI**：只换背景与裁切，不改面板样式、不加边框、不做高斯模糊。

## 6. 整窗图与入口特写

`run.sh` 在每个主题里跑两次 `capture.mts`：先拍五张功能图，再以 `PREVIEW=1` 拍整窗与头部条。
裁切由 `crop.py --preview` 完成：

1. **整窗**：打开面板、展开两个分区、滚动到顶，`Page.captureScreenshot` 整页（5760×3600），
   缩放到 1920×1200 → `docs/assets/preview-right.png`（暗色 `preview-right-dark.png`）；
2. **入口特写**：关掉面板后拍整窗，从窗口右缘裁 `115×44` CSS px（4x 像素 `460×176`），
   再放大 2 倍 → `docs/assets/preview-badge.png`（920×352，README 里按 460 宽显示，暗色同理）。

四个固定量都在 `crop.py` 的 `SCALE` / `WINDOW` / `BADGE` / `BADGE_BOX` 里：
`SCALE=4` 对应 Chrome 的 `deviceScaleFactor`，窗口 1440 CSS 宽、头部约 44 CSS 高，入口图标组右对齐，所以只锚定右缘。
改窗口尺寸、DPR 或头部布局时同步改这四个常量。

只补预览图时（需 `KEEP=1` 保留 `$WORK`，或自己起一套环境）：

```bash
THEME=light PORT=61399 TOKEN=$TOKEN OUT=$WORK/raw PREVIEW=1 node tools/screenshots/capture.mts
python3 tools/screenshots/crop.py --raw "$WORK/raw" --theme light --out docs/assets --preview
```

Windows 上把 `python3` 换成 `PYTHON` 指向的解释器，并带上 `SHOT_VIEWPORT=1440x900@4`，
否则内容区尺寸和 `crop.py` 的 4x 常量对不上。

## 7. 内容规则

- 便笺文案只写与本插件相关的小事（发布说明、暗色对比度、390px 视口、空状态文案）。
  演示便笺固定为下面四条，顺序与 `tools/screenshots/lib/notes.mts` 的 `NOTES` 相同；
  这张表由 `tests/screenshot-notes.test.mts` 与 `NOTES` 逐字校验，改文案、状态或年龄时两处必须一起改：

  | 便笺 | 状态 | 时间（相对拍图时刻） |
  | --- | --- | --- |
  | 把发布说明里的截图换成新版面板 | 待续 | 46 分钟前 |
  | 核对暗色主题下的对比度 | 待续 | 12 分钟前 |
  | 确认 390px 视口下面板不溢出 | 归档 | 写于 2 小时前 · 归档于 1 小时前 |
  | 补一条空状态说明文案 | 归档 | 写于 1 天前 · 归档于 20 分钟前 |

- 演示会话的提问要**明确不调用工具**，否则会触发审批/沙箱错误，出现在截图里；
- 便笺时间用相对年龄（46 分钟 / 12 分钟 / 1 天）回拨，不要出现「刚刚」；
- 面板停在默认的**工作区**作用域。
  「会话」会打开另一份空清单；
- 展开「存储与更新」后会显示真实的演示文件路径。
  拍发布图时，用 `WORK` 指向路径中没有账号名或私人目录名的一次性目录。
  其余截图也只能出现演示工作区、演示会话与演示数据；
- **不露账号**：预览图拍摄前隐藏侧栏账号菜单（`[data-signed-out]` 那个按钮，带头像与昵称），登录态保留即可，
  模型回复照常；不要伪造登录或退出登录界面。

## 8. 验收清单

- [ ] 明暗两张并排时，除颜色外完全一致（文案、计数、时间、滚动位置）；
- [ ] 面板四条边都能看出边界：有阴影、有 0.5px 发丝线，背景是中性画布；
- [ ] 录入框没有蓝色焦点环；
- [ ] 五张功能图的面板宽度一致、留白一致；
- [ ] 四张预览图与功能图出自同一批便笺（名称、计数、时间一致）；
- [ ] 图里没有任何其它项目的信息（逐张过一遍）；
- [ ] 四张预览图里没有账号头像、昵称或邮箱；
- [ ] `npm test` 通过，便笺表与 `NOTES` 一致；
- [ ] `git status` 里没有 `.screenshots/`、`.pnpm-store/`、凭据文件。

## 9. 市场图标

改过市场图标时，重新从 `docs/assets/storefront-icon.svg` 渲染 `icon.png`（540 → 180，做法见第 1 节），
并在 16px 下确认还认得出来。

## 10. 故障排查

| 现象 | 原因 / 处理 |
| --- | --- |
| `dsh web authentication required` | 没带 `token`。`run.sh` 会从 `server.log` 里取，手工调试时从启动日志复制 `?token=…` |
| 页面出现 `Failed to load plugins` | 偶发的 client bundle 加载失败；`capture.mts` 的 `waitApp()` 会检测并重载，最多 5 次 |
| 面板没出现 | 当前会话不是演示会话。`run.sh` 用新 profile，刷新后会自动恢复到最近会话；手工调试时确认 `dsh.sessions.current` |
| 悬停不出现行操作 | 必须用 CDP `Input.dispatchMouseEvent` 真实移动鼠标；`element.hover()` 不触发 `:hover` |
| 便笺时间显示「刚刚」 | `bootstrap.mts` 写入演示便笺的宿主时间戳后，`capture.mts` 会重新读取并刷新页面；手工操作时请刷新 |
| 端口占用 | `PORT` / `CDP_PORT` 换一个；`run.sh` / `run.ps1` 退出时会按端口清理残留进程 |
| 功能图四周留白不对 / 面板比预期窄 | 内容区不是 1440×900。Windows 上 headless 的 `--window-size` 会被边框吃掉像素，`run.ps1` 已用 `SHOT_VIEWPORT=1440x900@4` 固定；手工跑时记得也带上这个变量 |
| 入口特写裁歪了 | 头部图标不再右对齐，或窗口不是 1440 宽；调整 `crop.py` 的 `BADGE_BOX`，必要时重拍头部条 |
| Chrome 起不来（`GPU process isn't usable` / sandbox） | 需要 `--no-sandbox`；DSH 文件沙箱下还要 `--user-data-dir` 指向可写目录 |
| 面板边缘看不清 | 裁切没有外扩，或背景不是中性画布；回到第 5 节 |

## 11. 安全

- 凭据复制是**可选**的：只有 `COPY_CREDENTIALS=1` 才会把 `~/.dsh/.credentials.yaml` 复制到 `$WORK/dshhome/`，
  该临时目录在 `run.sh` 退出时删除；不要把凭据拷进仓库或提交。
- 启动日志里的 `token` 只存在临时目录与进程环境变量中，脚本不打印、不写入产物。
- 截图只落在 `docs/assets/features/` 与 `docs/assets/preview-*.png`；`$WORK`、
  `.screenshots/` 与 `.pnpm-store/` 不进入版本库（`.gitignore` 已覆盖）。

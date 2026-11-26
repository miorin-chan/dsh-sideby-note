# 测试案例目录（Catalog）

这里只有一件事：**用稳定的 ID 描述「需要验证什么」**。
怎么验在 `tests/*.test.mts`，这次验没验、结果如何属于执行记录（`run.json`，
见 [`docs/testing.md`](../../docs/testing.md#7-执行记录与复核)）。

目录不是第二份测试实现：不要在这里写代码、断言或 fixture。

**用例从 [`design.yaml`](./design.yaml) 的业务规则推导，不从测试反推。** 规则 → 用例 → 测试是单向的，
方法与判断标准见 [`docs/case-design-method.md`](../../docs/case-design-method.md)。

## ID 规则

`<域>-<三位序号>`，例如 `NOTE-004`。

| 前缀 | 域 | 文件 |
| --- | --- | --- |
| `NOTE` | 便笺内容与生命周期 | `note.yaml` |
| `SCOPE` | 清单范围与归属（工作区 / 会话） | `scope.yaml` |
| `STORE` | 存储、草稿、失败降级 | `store.yaml` |
| `FWD` | 转发回输入框 | `forward.yaml` |
| `PANEL` | 入口、面板、页脚详情、可达性 | `panel.yaml` |
| `I18N` | 语言与文案 | `i18n.yaml` |
| `PKG` | 包与构建产物 | `package.yaml` |
| `INST` | 安装器与宿主端点（暂无） | — |
| `REL` | 发版工具链与变更日志（暂无） | — |
| `UI` | 设计令牌与样式政策（暂无） | — |

- **只增不复用。** 案例退役写 `retired: true` 与理由，编号保留。
- 重构、改函数名、拆文件只改 `automation` 指针，ID 与 `expected` 不动。

## 字段

```yaml
- id: NOTE-004                 # 必填，稳定
  title: 新便笺写入后立即出现在列表
  priority: P0                 # P0 数据丢失/加载失败 · P1 主要体验 · P2 细节 · P3 文档
  class: B                     # A 主流程 · B 合法变体 · C 规则与边界 · D 异常输入/状态 · E 故障恢复 · F 并发与交互
  rules: [R-NOTE-PERSIST]      # 必填，指向 design.yaml 里的业务规则，至少一条
  risk: data_loss              # data_loss | crash | ux | privacy | docs | build
  owner: note                  # 谁对这条的语义负责
  expected:                    # 必填，验收标准；只有人能改
    - 列表出现该条
  automation:                  # 有自动化时必填，可多条（单测 + 集成 + E2E）
    - type: integration        # unit | contract | integration | e2e | policy
      file: tests/bundle.test.mts
      test: NOTE-004 新便笺写入后立即出现在列表
      status: automated        # automated | manual | planned | waived
  suites: [pr, nightly, release]   # smoke | pr | nightly | release | deep
  tags: [persistence, ui]
  # state: planned             # automated（默认）| planned | manual | retired
  # reason: 为什么已设计但还没实现（planned 必填）
  # waiver: 为什么这条 P0 暂时没有自动化（P0 无自动化时必填）
```

文件顶部可以写 `domain:` 与 `owner:` 作为默认值，案例里再覆盖。

## 测试侧约定

用例名以 ID 开头，目录通过 **完整用例名** 绑定：

```js
await t.test('NOTE-004 新便笺写入后立即出现在列表', async () => { … })
```

`tests/bundle.test.mts` 的 jsdom 流程是一条串行会话，子用例按顺序共享同一个 jsdom 与状态；
单个子用例失败不会中断后面的子用例，因此一次运行就能看到每个案例的结果。

**注意：** 正因为是串行会话，单独执行其中某一个（`--test-name-pattern='NOTE-004'`）会因为缺少前置状态而失败。
选择执行时应当跑完整个文件，再按 junit 里的 `testcase name`（就是带 ID 的用例名）读取每条结果；
「选中」的含义是「这次必须 PASS 的集合」，不是「只运行这些」。

## 六类设计（A–F）

每条案例必须属于且只属于一类，代表它**主要**在验证什么（分类指导设计，不限制一条案例同时涉及多类）：

| 类 | 验证目标 | 本仓例子 |
| --- | --- | --- |
| A 正常主流程 | 核心链路能完整跑通 | `NOTE-001` 新增便笺、`PKG-001` 产物加载 |
| B 正常业务变体 | 合法条件下的不同分支 | `SCOPE-003` 切到会话清单、`FWD-001` 兼容旧偏好时递入原文 |
| C 业务规则与边界 | 规则判断、阈值、状态迁移 | `NOTE-002` 清除需二次确认、`SCOPE-005` 归档保持独立 |
| D 异常输入与状态 | 非法请求/非法状态被正确拒绝 | 损坏存储、空白输入、无工作区会话 |
| E 技术故障与恢复 | 依赖失败后安全且可恢复 | 存储不可用、配额超限 |
| F 并发与复杂交互 | 交错执行不破坏约束 | 跨标签页同步、重复提交、保存与切换交错 |

建设顺序：先 A/B 跑通业务，再 C 补规则边界，再 D/E，最后 F；但 P0 级风险（数据丢失、
插件加载失败）不受顺序约束，应尽早补。
覆盖情况见 [测试工程 · 覆盖矩阵](../../docs/testing.md#5-覆盖矩阵)。

## 评审

规则要人来判断，评审工具只负责把「判断」之外的事情去掉：

```bash
npm run design:review                      # 一屏索引：规则、分支数、用例数、评审状态
npm run design:review -- --since origin/main   # 只看这次改动过的规则
npm run design:review -- --approve --by <你的名字> [--rules R-NOTE-TEXT]
npm run design:review -- --strict          # P0 相关规则未评审或评审过期时退出 1
```

`design.yaml` 的每条规则除了 `statement`，还有：

- `failure`：违反它时用户会遇到什么。
  评审先看这行，比读规则本身快。
- `branches`：结构化分支，`kind` 取 `valid / invalid / boundary / n-a`；`n-a` 必须写 `reason`。
- `technique`：推导用例用的方法（等价类、边界值、决策表、状态迁移、故障注入、并发测试、不变量、时序）。
- 可选 `reviewed: { by, at, hash }`：由 `--approve` 写入。
  `hash` 覆盖 statement + failure + branches，内容一改审批就自动失效，不会出现「签了名但没看新版本」。

## 校验

```bash
npm run catalog:check
```

`tools/catalog/check.mts` 会检查：**每条规则都有用例、每条用例都指向真实规则**、ID 格式与唯一性、
必填字段与枚举（含 A–F 分类与 planned 状态）、`automation` 指向的用例真的存在（文件与名字都要对上）、
P0 必须有自动实现或 waiver，以及**反向**检查——测试里以 ID 开头的用例必须都在目录里，避免孤儿 ID。

CI 在 `npm run test:run` 之后跑同一条命令。
改目录忘改测试、或改测试忘改目录，都会失败。

## 新增一个案例（顺序不能反）

1. **先看规则**：在 [`design.yaml`](./design.yaml) 里找到要验证的规则；没有就先加规则并写清有效/无效分支；
2. **再写用例**：在对应域的 YAML 里追加未被占用的 ID，`rules` 指向该规则，`expected` 用业务语言写验收标准。
   暂时不写测试也可以，标 `state: planned` + `reason`；
3. **最后写测试**：在 `tests/*.test.mts` 里写 `t.test('<ID> <标题>', …)`，把完整用例名填进 `automation.test`，
   去掉 `state: planned`；
4. `npm run catalog:check` 通过后提交。

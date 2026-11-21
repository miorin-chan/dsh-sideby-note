# 用例设计方法：先规则，再用例，最后才是测试

本文件固定本仓库的用例生产方式。核心只有一句：**用例从业务规则推导，不从测试代码反推。**

## 1. 为什么不能从测试反推

`tests/` 里的每个 `test('…')` 都带着实现痕迹：它为了驱动 jsdom 顺手断言了某个 className、某个 `rAF` 延迟、某个存储顺序。
拿这些断言当「用例」会有三个后果：

1. **用例描述的是「代码做了什么」，不是「业务要求什么」。** 重构一次，断言变了，用例跟着变，验收标准就成了橡皮筋。
2. **覆盖关系错位。** 一个测试常常覆盖三条规则的一半，而一条规则又被两个测试各覆盖一半；反过来看不到「这条规则到底验没验」。
3. **缺口被掩盖。** 测试没写的地方，反推法也推不出用例——缺的那一块不会自己冒出来（本仓库的 D 类异常、F 类并发就是这样空着的）。

正确链路是单向的：

```text
业务规则 / 不变量（design.yaml）
        ↓ 等价类、边界值、决策表、状态迁移、故障注入
测试用例（cases/*.yaml，稳定 ID，写清验收标准）
        ↓ 新建或改造测试
自动化测试（tests/*.test.mjs，用例名以 ID 开头）
        ↓ 执行
执行记录（run.json，尚未实现）
```

任何一步都不许反向生成。

## 2. 规则怎么写

规则描述「什么样算对」，不引用测试、函数或文件名。字段见
[`tests/catalog/design.yaml`](../tests/catalog/design.yaml)：

```yaml
- id: R-NOTE-TEXT
  statement: 便笺文本去除首尾空白后必须非空；超过 280 字符的部分被截断，而不是拒绝写入。
  failure: 空白便笺变成点不掉的空行；超长粘贴被整条拒绝，用户以为没记上。
  kind: validation
  branches:
    - { kind: valid, text: 1–280 字符的非空文本被完整保存 }
    - { kind: invalid, text: 空或纯空白文本不产生任何记录 }
    - { kind: boundary, text: 280 字符完整保留，281 字符起被截断到 280 }
  technique: [等价类, 边界值]
```

- `branches` 是硬要求：至少一个 `valid`，以及一个 `invalid` / `boundary` / `n-a`。确实没有无效分支的
  （如「只注入一张样式表」），用 `n-a` 并写明 `reason`，而不是留空。
- `failure` 是评审入口：它回答「不守这条规则会怎样」，评审者判断要不要这样，比逐字读规则快。
- `technique` 记录推导手法，方便 reviewer 判断案例是否系统，而不是随手挑了几个。

## 3. 从规则推导用例

四个手法对应四类规则，本仓库的使用情况：

| 规则形态 | 手法 | 例子 |
| --- | --- | --- |
| 输入有约束 | 等价类 + 边界值 | `R-NOTE-TEXT` → `NOTE-005`（空白）、`NOTE-006`（280/281） |
| 多条件组合 | 决策表 | `R-SCOPE-DEFAULT` + `R-SCOPE-BLANK` → `SCOPE-002/003/004/008` |
| 生命周期 | 状态迁移 | `R-NOTE-LIFECYCLE` → `NOTE-002`（完成）、`NOTE-008`（取消完成，计划中） |
| 依赖会失败 | 故障注入 | `R-STORE-READ-FAIL` / `R-STORE-WRITE-FAIL` → `STORE-011/012`（计划中） |
| 跨操作约束 | 不变量 | `INV-NO-LOSS` → `STORE-007/013/014/015` |

一个完整示例（本仓库真实走过）：

1. 规则 `R-NOTE-TEXT` 声明了三个分支；
2. 已有的 `NOTE-001` 只覆盖「有效」分支，`R-NOTE-TEXT` 被引用但无效分支和边界分支都没有用例；
3. 于是新增两条**先于测试存在**的用例：`NOTE-005`（无效分支）、`NOTE-006`（边界分支），
   状态标 `planned`、写清 `reason`；
4. 这时才写测试，把两条用例接上 `automation`，状态转 `automated`。

第 3 步是关键：**用例先于实现存在**，缺口在目录里可见，而不是等某天有人想起来补测试。

## 4. 用例字段与状态

| 字段 | 说明 |
| --- | --- |
| `rules` | 该用例主要验证哪些规则（必填，至少一条）。规则必须先在 `design.yaml` 里存在 |
| `expected` | 验收标准，业务语言，不写断言细节。只有人能改 |
| `state` | `automated`（默认）/ `planned`（已设计、未实现）/ `manual` / `retired` |
| `reason` | `planned` 必填：为什么现在还没实现 |
| `waiver` | P0 用例没有自动化时必填：谁批准、为什么可以暂时没有 |
| `automation` | 指向具体测试：文件 + 完整用例名 + 实现类型。`planned` 时可以为空 |

一条规则可以先有用例而没有测试（`planned`），但不能既没有用例也没有记录——`catalog:check` 会因为规则未覆盖而失败。

## 5. 什么算设计完成

对照规范里的完成准则，本仓库把它落成可校验的检查：

| 准则 | 校验方式 |
| --- | --- |
| 每条规则至少一条用例 | `check.mjs`：未覆盖规则 → 失败 |
| 每条用例至少一条规则 | `check.mjs`：缺 `rules` 或引用了不存在的规则 → 失败 |
| 每条不变量指向真实规则 | `check.mjs` 校验 `invariants[].rules` |
| P0 有用例且已自动化（或明确豁免） | `check.mjs`：P0 无自动化且无 `waiver` → 失败 |
| 计划中的用例有理由 | `check.mjs`：`state: planned` 无 `reason` → 失败 |
| 测试与用例一一对应 | `check.mjs`：反向检查 ID 前缀测试是否都在目录里 |

它不检查「每条规则的有效/无效分支是否都实际跑了」——这一条目前靠人 review `design.yaml` 的 `branches` 与用例清单。
如果将来要机器化，可以给分支加 ID，让用例声明 `branch: valid|invalid|boundary`。

## 5.5 让评审变成判断题

评审慢不是因为规则多，而是因为每条规则都要读者自己拼上下文。工具把上下文补齐：

```bash
npm run design:review                         # 一屏索引：规则 / 分支数 / 用例数 / 评审状态
npm run design:review -- --since origin/main  # 只列改过的规则及其影响面
npm run design:review -- --approve --by <name> [--rules R-…]
npm run design:review -- --strict             # P0 规则未评审时退出 1（可用于后续 CI）
```

审批写入的是内容哈希而不是版本号：`statement`、`failure`、任一分支改动，`reviewed.hash` 就对不上，
`catalog:check` 会直接报「评审已过期」。这样不会出现「签过名，但签的是旧文本」。

评审顺序建议：先看 `failure`（这是不是不能接受的结果），再看 `statement`（规则本身对不对），
最后看 `branches`（有效/无效/边界有没有漏）。P0 规则优先，其余可以批量扫过。

## 6. 增删改的规矩

- **新增需求**：先在 `design.yaml` 加/改规则 → 再推导用例（可以是 `planned`）→ 最后写测试。
- **改实现**：只允许改 `automation` 指针与测试；`rules`、`expected` 不动。
- **规则变更**：必须显式改 `design.yaml` 并说明原因（这是唯一能改变业务语义的入口）。
- **退役用例**：`state: retired` + 理由，ID 永不复用。
- **AI Agent**：可以提出新规则、补用例、写测试；**不能**擅自修改已有规则的 `statement` 或已有用例的 `expected`。

## 7. 当前状态

```text
64 条用例（全部自动化）· 38 条规则（38/38 已覆盖、38/38 已人工评审）· 4 条不变量
```

目录里已没有 `planned` 用例：上一版的 12 条全部实现并接上 `automation`，`catalog:check` 的 `by state` 现在是 `automated=58 planned=0`。

## 参考

- 规则与不变量：[`tests/catalog/design.yaml`](../tests/catalog/design.yaml)
- 用例目录与字段：[`tests/catalog/README.md`](../tests/catalog/README.md)
- 测试工程与覆盖矩阵：[`testing.md`](./testing.md)

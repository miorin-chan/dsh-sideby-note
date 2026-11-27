# 测试工程

本文件描述**已经定稿**的测试流程。
业务规则怎么写、用例怎么推导见 [`case-design-method.md`](./case-design-method.md)，
目录字段与 ID 规则见 [`tests/catalog/README.md`](../tests/catalog/README.md)。

## 1. 四层结构

| 层 | 位置 | 职责 | 变更时机 |
| --- | --- | --- | --- |
| 规则 | `tests/catalog/design.yaml` | 定义业务规则与不变量，列出有效和无效分支 | 业务语义变化，需重新评审 |
| 用例 | `tests/catalog/*.yaml` | 定义验收场景，使用稳定 ID 并引用业务规则 | 规则变化时推导 |
| 测试 | `tests/*.test.mts` | 验证实现，目录用例对应的测试名以 ID 开头 | 实现或重构变化 |
| 执行记录 | `.test/runs/<run_id>/` | 定义「这次验没验」：逐用例结果、失败摘要、复核签名 | 每次执行 |

链路是单向的：规则 → 用例 → 测试。
测试不能反过来生成用例。

## 2. 命令

| 命令 | 用途 |
| --- | --- |
| `npm test` | 只跑测试（最快反馈） |
| `npm run check` | lint + typecheck + build + test + catalog:check |
| `npm run catalog:check` | 规则/用例/测试三层一致性与字段校验 |
| `npm run design:review` | 规则索引；`--since <ref>` 只看改动；`--approve` 记录评审；`--strict` 卡 P0 |
| `npm run test:run` | 跑测试并落执行记录与报告（`.test/runs/`） |
| `npm run test:strict` | 发布门禁：全部通过 + 已复核 + 结果未被改动 |
| `npm run test:mutate` | 变异测试：确认用例能抓到真实缺陷 |

`test:run` 支持 `--suite release` 只统计某套件、`--compare` 与上次执行对比、`--approve --by <name>` 记录复核。

## 3. 门禁

CI（`.github/workflows/ci.yml`）按顺序执行：

1. `pnpm install --frozen-lockfile` 安装依赖并构建 Host、Client 和安装器。
2. 连续两次 `npm pack` 校验打包结果是否一致，并核对包内的运行文件、安装器权限和 shebang。
3. `npm run typecheck` 执行类型检查。
4. `node scripts/build.mjs --check` 校验构建产物，`node scripts/sync-types.mjs --check` 校验 DSH 类型依赖版本。
   未设置 `DSH_INSTALL_DIR` 时，CI 会跳过类型版本比对。
5. `npm test` 重新构建并运行 `tests/*.test.mts` 下的全部代码测试。

本地仍可使用规则与用例目录及相关命令（`npm run catalog:check`、`npm run test:run`、
`npm run design:review` 和 `npm run test:strict`）。
这些命令不再是 CI 门禁。

## 4. 规则与用例

- 规则字段：`statement`、`failure`（违反后果）、结构化 `branches`（valid / invalid / boundary / n-a）、
  `technique`、可选 `reviewed`。
- 评审签名绑定 `statement + failure + branches` 的哈希，改动自动失效。
- 用例按 A–F 六类标注：A 正常主流程、B 合法变体、C 规则与边界、D 异常输入/状态、E 故障恢复、F 并发与交互。
- 规则、用例、评审数量以及分布由 `npm run catalog:check` 和 `npm run design:review` 汇总。

## 5. 覆盖矩阵

| 维度 | 覆盖用例 |
| --- | --- |
| 输入异常 | `NOTE-005` 空白、`NOTE-006` 超长、`STORE-017` 畸形记录 |
| 数值边界 | `NOTE-006` 280 字符、`PANEL-009` 宽度 280–720 |
| 业务规则 | 范围归属、清除确认、填入的会话隔离、更新区间与兜底 |
| 状态异常 | 归档与退回、`SCOPE-009` 从空白到首轮、`SCOPE-011` 遗留范围回落 |
| 时间异常 | `PANEL-010` 确认 5 秒、`UPD-006` 缓存 1 小时、`NOTE-009` 相对时间分档 |
| 依赖故障 | `STORE-011` 读不到、`STORE-012` 写不进、`UPD-001/007/008` 探测与宿主回退 |
| 重复与乱序 | `SCOPE-001/012` 并入幂等、`FWD-006` 重复点击、`STORE-013/014/015` 并发合并 |
| 并发冲突 | `STORE-013/014/015` 双端写入、`STORE-016` 跨标签页刷新、`SCOPE-013` 保存与切换交错 |
| 一致性异常 | `SCOPE-005/006/007` 清单归属、`STORE-002/006` 草稿、`FWD-002` 转发标记、`STORE-012` 写失败无幽灵条目 |
| 容量异常 | `STORE-018` 400 条仍可展示与新增；`STORE-027` 宿主模式 401 条 |
| 宿主切换 | `STORE-019/020/021/024` 迁移、拒绝切换、宿主已有数据、迁移中断恢复 |
| 宿主故障 | `STORE-022/025/029` 已切换后不可用、宿主文件打不开、同一领域被另一插件占用 |
| 宿主并发 | `STORE-023` 两标签页 diff 合并 |
| 存储路径 | `STORE-028` 完整路径、拷贝、文件管理器定位 |

未覆盖的一项：面板高度下限（240）没有用例；补它需要给 `R-PANEL-GEOMETRY` 加分支并重新评审。

## 6. 有效性

`npm run test:mutate` 对实现注入 13 个真实缺陷（去掉截断、去掉合并、吞掉写失败、
解除范围限制、恢复条数上限等），重建后跑全套用例，记录哪些用例失败或缺失。
上游 1.2.0 跑出的结果为 13/13，逐条见 [`test-validity.md`](./test-validity.md)。

这套检查有真实价值：首轮只有 9/13，两个存活的变异暴露了「存储侧超长文本未测」和「假时钟掩盖了确认窗口常量」两个盲区，
补测后才达到 13/13。

局限：13 个变异是手工挑选的关键路径，不等于全量变异测试；宿主路径（`STORE-019`–`STORE-028`）尚未纳入变异集，
变异仍针对本地回退与 UI。

## 7. 执行记录与复核

一次 `test:run` 产出：

| 文件 | 内容 |
| --- | --- |
| `junit.xml` | Node 原始结果 |
| `run.json` | 逐用例：ID、结果、耗时、失败摘要；外加 commit / branch / node / 时间 / 按域汇总 / 与上次对比 |
| `report.md` / `report.html` | 人读版报告 |

结果只有四种：`PASS / FAIL / SKIPPED / MISSING`。
`MISSING` 表示目录里有这条用例、这次却没有测试产出结果，**不算通过**。

复核：`--approve` 写入 `{ by, at, digest }`，`digest` 是全部结果的哈希；结果被改动后复核失效，`test:strict` 会拒绝。
执行记录只保存在本地 `.test/runs/`，不提交 `.test/`。

## 8. 已知边界

1. **真机验证**：配额满、磁盘满、profile 只读在 jsdom 里注入。
   宿主路由由单元和集成测试覆盖，`aside_note.json` 的读写可用真实 DSH 存储栈验证。
   Electron 界面验收按[本机实装与验收 SOP](./auto-test-sop.md)执行。
2. **发版证据**：`run.json` 目前只保存在本地，发版时应挂到 GitHub Release 作为长期证据，尚未接入；
3. **性能**：400 条已验证功能可用，滚动与渲染耗时未测量；
4. **变异测试**：13 个变异覆盖关键路径，不是全量；宿主迁移、宿主合并与错误态没有对应变异；
5. **宿主多进程**：多个 DSH 进程共用同一 `$DSH_HOME` 时没有跨进程写锁，测试未覆盖，属于已知限制。

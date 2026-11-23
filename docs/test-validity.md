# 测试有效性证据（变异测试）

- 时间：2026-11-18T09:35:38.100Z
- 变异数：**13** · 被抓到：**13** · 存活：**0**
- 方法：对实现注入一处真实缺陷 → 重建产物 → 跑全部用例 → 记录哪些用例失败或缺失 → 还原源码。
  存活的变异代表测试没覆盖到，不是通过。

| 变异 | 针对规则 | 预期抓到 | 实际失败/缺失 | 判定 |
| --- | --- | --- | --- | --- |
| `note-text-truncation` | R-NOTE-TEXT | NOTE-006 | NOTE-006 | ✅ 抓到 |
| `corrupt-backup` | R-STORE-CORRUPT | STORE-007 | STORE-007 | ✅ 抓到 |
| `merge-removed` | R-STORE-MERGE | STORE-013, STORE-014, STORE-015 | STORE-013, STORE-014, STORE-015 | ✅ 抓到 |
| `storage-guard` | R-STORE-READ-FAIL | STORE-011 | STORE-011 | ✅ 抓到 |
| `write-swallows-failure` | R-STORE-WRITE-FAIL | STORE-012 | STORE-012 | ✅ 抓到 |
| `confirm-never-expires` | R-NOTE-CONFIRM | PANEL-010 | FWD-006, I18N-002, NOTE-009, PANEL-010, SCOPE-012, SCOPE-013, STORE-017, STORE-018 | ✅ 抓到 |
| `blank-session-unlocks` | R-SCOPE-BLANK | SCOPE-008, SCOPE-011 | SCOPE-008, SCOPE-009, SCOPE-011 | ✅ 抓到 |
| `prefix-ignores-language` | R-I18N-PREFIX | I18N-001 | FWD-005, I18N-001 | ✅ 抓到 |
| `update-notes-keep-drafts` | R-UPD-NOTES | UPD-003 | UPD-003, UPD-004 | ✅ 抓到 |
| `capacity-cap-returns` | R-STORE-CAPACITY | STORE-018 | STORE-018 | ✅ 抓到 |
| `width-clamp-removed` | R-PANEL-GEOMETRY | PANEL-009 | PANEL-009 | ✅ 抓到 |
| `age-always-now` | R-NOTE-AGE | NOTE-009 | NOTE-009 | ✅ 抓到 |
| `legacy-ids-random` | R-STORE-SANITIZE | STORE-017 | STORE-017 | ✅ 抓到 |

## 怎么跑

```bash
node tools/catalog/mutate.mts
```

脚本会临时改源码、重建、跑用例，结束时恢复并使用还原后的源码重新构建；最后再跑一次完整用例确认工作树是干净的。

**范围说明：** 本文记录上游 1.2.0 的变异测试结果。13 个变异针对本地 `localStorage` 回退与 UI，宿主迁移、
宿主原子合并与宿主不可用错误态（`STORE-019`–`STORE-028`）尚未纳入该次变异测试。

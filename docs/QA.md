# 改造基线质量验收报告（历史记录）

> 本报告验收的是**改造前**的 `dsh-usage-statistics-panel@0.3.4` 本地增强版，
> 完成于本项目独立化之前。文中的包名、路由前缀与存储域均为当时的上游标识；
> 独立发布后的对应值见 [README.md](../README.md) 的「独立身份」表。
> 除标识重命名外，代码功能与本报告结论一致。

- 验收时间：2026-11-06 15:40 ~ 2026-11-07 00:18（Asia/Shanghai）
- 验收对象：`dsh-usage-statistics-panel@0.3.4` 本地增强版（源码复刻 + 补丁交付）
- 被测 GUI：本地 DSH Web GUI（验收期间持续有效）
- 源码工作树：本仓库（发布前位于本地构建工作区）
- 交付工具与独立对账工具：`tools/dsh-usage-panel-plus`、`tools/usage-panel-verify`（本机维护工具，未随本仓库发布）
- 已装包：本机 DSH desktop profile 的 `node_modules/dsh-usage-statistics-panel`（76 文件）
- 验收方式：只读检查 + 沙盘（不触碰真 profile）+ 真实 API 探针 + 独立日志重算
- 验收期间**未**调用 `/usage/api/reset`，未改动真 profile

## 总评

**结论：PASS（可交付）**，附 1 个低危功能滞后、1 个中危交付健壮性风险、3 条已知设计边界。

| 维度 | 结论 | 关键证据 |
|---|---|---|
| 源码 / 补丁 / 已装包一致性 | PASS | 60 个补丁文件三方 SHA-256 全等；`src/` 0 diff；三个 lib 产物重建后与已装包逐字节相同 |
| 类型与测试 | PASS | `tsc --noEmit` 0 error；433 tests / 37 files 全绿；`strict` + `noUncheckedIndexedAccess` |
| 构建可复现性 | PASS | 删掉 `node_modules` 后重装依赖（4.7s），重建三产物与已装包哈希全等；bundle 冒烟通过 |
| 真实 API / 窗口口径 | PASS | 8 个预设全部实测；`all`/`90`/`custom` 一致；百分比合计 100%；模型与供应商 token 和 = 总量；非法输入全部拒绝 |
| API 与自身 store 一致性 | PASS | `api_vs_store` 总量/模型/日级 **0 diff**（独立 oracle 报告） |
| GUI 实际服务的 bundle | PASS | `served-bundle-check`：`bodyEqualsLocal=true`，`verdict: PROVEN`；服务端仅多 48B sourceMappingURL 尾行 |
| 交付脚本 | PASS | 沙盘 apply→verify→重复 apply 被漂移检测拒绝→rollback→与原始包逐字节相同（69/69，0 diff） |
| 交付脚本格式 | PASS | 3 个 .ps1 = UTF-8 BOM + CRLF、PS 5.1 解析 0 错；3 个 .cmd = 纯 ASCII + CRLF |
| 会话维度 vs 日志重算 | **已知边界** | 独立 oracle 判 FAIL，但全部差异可归因到 3 条已记录的设计边界，见下 |

## 一、源码与产物一致性（PASS）

```
交付 manifest：original=69  patched=60  added=7  builtAt=2026-11-06 07:35:56
补丁一致性失败数：0        （manifest 哈希 vs package/ vs 已装包，逐文件）
工作树 src/ vs 已装 src/：0 diff
已装 lib：index.js 79,490B / client.js 206,866B / client-registry.js 206,940B
```

重建验证（依赖被 11-06 的清理删掉后重装）：

```
pnpm install --ignore-scripts --no-frozen-lockfile  → exit 0（tsdown 0.22.14 / vitest 4.1.11 / typescript 5.9.3）
tsc -p tsconfig.build.json + tsdown  → exit 0
index.js          worktree 79,490 = installed 79,490   equal=True
client.js         worktree 206,866 = installed 206,866  equal=True
client-registry.js worktree 206,940 = installed 206,940  equal=True
smoke-client.mjs → exports 齐全、3 个 slot 注册正常、client bundle smoke: OK
```

`verify.ps1 -Url http://127.0.0.1:<port>` 实跑（Windows PowerShell 5.1）：**14 项全 PASS**。

## 二、类型、测试与代码卫生（PASS）

```
tsc -p tsconfig.json --noEmit          → 0 error
vitest run                            → Test Files 37 passed / Tests 433 passed
locales.spec.ts（三语键与占位符一致）  → 4/4
api.spec.ts（含 CSV/缓存）             → 4/4
```

测试分布（top）：collector 44、stats-line 41、routes 34、stats-line-core 31、store 27、visual-scale 26、query 21、format 18、store-sessions 15、trust-fence 14、registration 12、session-usage 12。

代码卫生：`src/` 内无 TODO/FIXME/HACK；仅 2 处 `console.error`（错误路径日志，合理）；`as any` 仅 1 处；`strict: true` + `noUncheckedIndexedAccess: true`。

Effect / 监听器清理抽查（ChartTip、Deferred、Donut、stat-dialog、glass、StatsLineEnhanced、UsageStatsPanel）：定时器、ResizeObserver、事件监听均有对应清理；自动刷新 60s 在 `document.visibilityState !== 'visible'` 时跳过并在卸载时 `clearInterval`。

## 三、真实 API 与数据口径（PASS）

8 个预设实测（跨午夜前数值，之后 `all`/`90` 仍一致）：

| 预设 | from | to | granularity | tokens | sessions | models | providers |
|---|---|---|---|---|---|---|---|
| today | 11-06 | 11-06 | hour | 101,213,089 | 8 | 4 | 2 |
| 3 | 11-04 | 11-06 | hour | 550,978,124 | 19 | 5 | 3 |
| 7 | 10-31 | 11-06 | day | 660,052,269 | 25 | 5 | 3 |
| 14 | 10-24 | 11-06 | day | 1,329,366,371 | 39 | 8 | 5 |
| 30 | 10-08 | 11-06 | day | 1,729,897,870 | 45 | 19 | 10 |
| 90 | 08-09 | 11-06 | day | 1,847,848,935 | 45 | 23 | 10 |
| all | **10-02** | 11-06 | day | 1,847,848,935 | 45 | 23 | 10 |
| custom | 10-02 | 11-06 | day | 1,847,848,935 | — | — | — |

- `all` 起点 = store 最早一天 `2026-10-02`，终点 = 今天；`all == 90 == custom(10-02..11-06)`（store 仅有 30 个有数据的天）。
- 跨午夜后 `all.to` 自动变 `11-07`，`all` 与 `90` 的 tokens、sessionCount 仍完全相等。
- `model.percent` 合计 / `provider.percent` 合计 = 100.0000；models token 和 = providers token 和 = total。
- 23/23 个模型都带 `cacheHit/cacheMiss`（命中率数据通路生效）。
- 非法输入全部拒绝：不存在的日期、`to < from`、跨度 >366 天。
- 环比 `previous`：30d 有值，90d/all 全零（store 无更早历史，结构性正确）。

独立 store 重算（`tools/usage-panel-verify/run-all.mjs --range 30`，oracle A → 面板快照 → oracle B 夹逼）：

```
checks.api_vs_store.totals   → 全字段 0 diff（tokens/requests/turns/cacheHit/cacheMiss/activeDays）
checks.api_vs_store.models   → 19 个模型全 0 diff
checks.api_vs_store.daily    → 0 mismatched
```

`served-bundle-check.mjs`：`HTTP 200 / 206,914B / ModuleLoaderShape=true / bodyEqualsLocal=true / verdict: PROVEN`，GUI 服务的是已装补丁包（服务端多 48B sourceMappingURL 尾行，归一化后一致）。

## 四、会话维度：oracle 判 FAIL 的完整归因（已知设计边界，非回归）

独立 oracle 的 `verdict: FAIL`，两个驱动因素：

```
sessionCount : panel=45  oracleA=39  oracleB=39  → delta=6
sessions     : failing=2  onlyPanel=6  onlyOracle=0
```

**全部差异都能对上此前已记录、并在 UI 文案中披露的三条设计边界：**

1. **6 个 ONLY-PANEL 会话 = 日志已删除的会话**（`c2565875` / `59ccdc12` / `6a054380` / `8ed9fa02` / `d8a45922` / `bbb6bedc`）。
   `sessionCount` 45 vs oracle 39 的 6 个差额正好是这 6 个。它们的 token 仍计入 day/hour 总量（故 `api_vs_store` 0 diff），但无法从日志重算归因。
2. **`97d8db27` = 当前正在运行的会话**（标题「优化用量面板与界面并全面验收插件」）。
   panel 185,797,370 vs oracle 271,890,790，缺 86,093,420。store 中该会话只有 8 行（11-04 起），且 `sessionsLiveFirstSeq["session-97d8db27…"] = 1850`。这正是 `liveOwnedWhole`：拿不到可靠 seq 边界时跳过而不重复计数，**不标记 seen，下次重启从零自愈**。
3. **`5a021084` 缺 1 个 turn**：tokens/requests/title/lastSeen/firstSeen/models 全部精确一致，仅 `turns` 7 vs 6，`turnMode=mismatch`。对应 live 路径不观测 interrupted turn 的既有边界。

补充：store 游标 `sessionsCoverage=2`、`sessionsReady=true`、`sessionsBackfilledSessions` 34 个、`sessionsLiveFirstSeq` 已写入，说明 v2 迁移逻辑在位。`unknownRequests` 面板 43 = store 43（API 与自身持久化一致），oracle 日志可见 39，差 4 是已删会话份额。

**判定：这不是本轮改动引入的回归。** oracle 的 PASS 判据要求「sessionCount 精确等于日志可见会话数」，而该插件的设计选择是「保留已删会话的会话行、只保证 day/hour 总量可归属」，二者口径不同。UI 的 `sessionsHint` / `sessionUsageHint` 已明写「仅含日志仍存在的会话」的反向说明（更准确的说法是「已删会话无法还原」）。**建议**：把这条口径差异写进 README，并给 oracle 增加一个 `--allow-deleted-session-gap` 模式，避免未来把预期差异读成回归。

## 五、缺陷清单

### D1（低危 / 功能滞后）CSV 导出缺缓存命中字段

- 位置：`src/client/csv.ts:56-62`（`CSV_ROW_FIELDS`）
- 宿主已为每个模型返回 `cacheHit/cacheMiss`，UI 已展示每行命中率，但 CSV 的 `model` 行只导出 `model/provider/tokens/percent`，`session` 行只导出 `session/title/tokens/requests/turns/lastSeen/topModel`。
- 影响：导出的表格无法复算命中率，与屏幕显示不一致。不改变任何运行时行为。
- 建议：`model` 增 `cacheHit/cacheMiss`（或 `hitRate`），`session` 增同样两列；同步补 `api.spec.ts` 的列断言。

### D2（中危 / 交付健壮性）`build-package.mjs` 在 worktree 缺失时会静默产出空包

- 位置：`tools/dsh-usage-panel-plus/build-package.mjs:72`（`fs.rmSync(pkgDir)` 先清空再写），`walk()` 对不存在的路径返回 `[]` 且不报错（`:53-59`）。
- 已在 2026-11-05 真实发生过一次：另一个会话清掉了历史临时工作树 tmp/usage-panel-fork，`--worktree` 默认指向该路径，结果 `package/` 的 60 个文件被清空成 0；靠 manifest 与已装包逐字节重建才恢复。
- 影响：不会损坏已装包，但会生成一个「看起来成功、实际为空」的交付包，若此时执行 apply 会把补丁写成半包。
- 建议：在脚本开头加 `--worktree` 存在性 + `lib/index.js` 等必需产物的硬校验，缺失即 `throw` 并保持原 `package/` 不动（先写临时目录再原子替换）。

### 已验证无缺陷的相邻项

- `apply.ps1` 的漂移检测、整目录备份、复制后逐文件复算、PS 5.1 参数默认值解析（`$PSScriptRoot` 陷阱）均正确。
- `rollback.ps1` 恢复 69 文件并删除 7 个新增文件，回滚后与原始包 **0 字节差异**。
- `verify.ps1` 的 14 项检查覆盖了哈希、bundle 形状、externals、体积、宿主标记与 live API。
- 环形图与列表的配色在 >10 模型时循环复用（`chartSlot`），无 Other 桶，环与列表排名同一集合。

## 六、未能覆盖 / 需人工确认

- **浏览器视觉回归**：无截图 DOM 上下文，未做像素级视觉验证；布局结论来自 CSS 源码守卫（26 项 `visual-scale.spec.ts`）而非渲染截图。建议人工在 GUI 上确认：窄窗口工具栏、两个滚动列表、悬浮提示卡、会话展开明细。
- **重启后宿主半**：本次验收未重启 DSH。`verify.ps1` 的 live 探针显示运行宿主已带会话维度与 `all` 支持，但**从本次改动算起的宿主半是否需重启**仍以页面刷新后行为为准；若「全部」退回 7 天窗口，重启一次即可。
- **`all` 超过 180 天**：趋势图有 180 天可视上限，当前 store 仅 30 天有数据，未实测 >180 天时「仅显示最新 N 天」提示与列表全量合计并存的场景。
- **CSV 实际下载**：只跑了 `buildCsv` 的纯函数测试，未在 Electron shell 里点下载。

## 七、复核入口

| 目的 | 命令 / 文件 |
|---|---|
| 全量测试 | `node node_modules/vitest/vitest.mjs run`（工作树内，Node 24） |
| 类型检查 | `node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` |
| 重建 | `node node_modules/typescript/bin/tsc -p tsconfig.build.json && node node_modules/tsdown/dist/run.mjs` |
| 交付自检 | `powershell.exe -ExecutionPolicy Bypass -File tools/dsh-usage-panel-plus/verify.ps1 -Url $env:DSH_WEB_URL` |
| 独立对账 | `node tools/usage-panel-verify/run-all.mjs --range 30 --url $env:DSH_WEB_URL` → `out/compare-30.json` |
| 服务 bundle | `node tools/usage-panel-verify/served-bundle-check.mjs --url $env:DSH_WEB_URL --expect-size <size> --local <installed client.js>` |
| 沙盘证据 | `tools/usage-panel-verify/out/qa-sandbox/`（apply 备份、回滚后的 69 文件副本） |
| 本次 oracle 原始结果 | `tools/usage-panel-verify/out/compare-30.json`、`oracle.json`、`oracle-after.json`、`panel-snapshot.json` |

---

**验收人**：Lead（含两名独立子任务，均因模型限流中断，其检查项由 Lead 逐项补做）
**最终结论**：**PASS**，建议修复 D1/D2 后再对外分发；三条会话设计边界建议写入 README 而非当作 bug 修。

/**
 * Usage panel dictionaries, registered into the DSH locale service. The keys
 * mirror the reasonix stats locale block (settings.stats.*) plus the PR#7503
 * additions ("Other", 180-day trend note); values are the same Chinese and
 * English copy with the zh-TW variant transliterated.
 */

/** The locale namespace this plugin owns. */
export const LOCALE_NS = 'usagePanelPlus'

/** The typed translator key union for the panel's locale seat. */
export type UsageStatsKey =
  | 'nav'
  | 'back'
  | 'range'
  | 'rangePreset.today'
  | 'rangePreset.3'
  | 'rangePreset.7'
  | 'rangePreset.14'
  | 'rangePreset.30'
  | 'rangePreset.90'
  | 'rangePreset.all'
  | 'rangeCustom'
  | 'from'
  | 'to'
  | 'refresh'
  | 'rebuild'
  | 'rebuildConfirm'
  | 'rebuilding'
  | 'rebuildHint'
  | 'export'
  | 'exportHint'
  | 'exportFailed'
  | 'autoRefresh'
  | 'autoRefreshHint'
  | 'updatedAt'
  | 'loading'
  | 'tokens'
  | 'tokensHint'
  | 'tokensUnit'
  | 'cachedTokens'
  | 'hitRateShort'
  | 'hitRateNone'
  | 'hitRateLabel'
  | 'sessions'
  | 'sessionsHint'
  | 'turnsShort'
  | 'requests'
  | 'requestsShort'
  | 'activeDays'
  | 'cacheRate'
  | 'cacheRateHint'
  | 'comparePrev'
  | 'cacheHitRate'
  | 'hitRateLegend'
  | 'topModel'
  | 'topModelHint'
  | 'heatmap'
  | 'heatLess'
  | 'heatMore'
  | 'dailyTrend'
  | 'hourlyTrend'
  | 'trendLimited'
  | 'sessionUsage'
  | 'sessionUsageHint'
  | 'sessionTopModels'
  | 'sessionTruncated'
  | 'lastActive'
  | 'noSessions'
  | 'unknownRequests'
  | 'modelUsage'
  | 'modelUsageHint'
  | 'providerUsage'
  | 'providerUsageHint'
  | 'providerModels'
  | 'other'
  | 'total'
  | 'percent'
  | 'asOf'
  | 'empty'
  | 'cachePrecision'
  | 'cachePrecisionDesc'
  | 'tokenDetail'
  | 'tokenDetailDesc'
  | 'streamThroughput'
  | 'streamThroughputDesc'
  | 'stats.counts'
  | 'stats.tokensPerSecond'
  | 'stats.cacheHit'
  | 'stats.cacheMiss'
  | 'stats.dialog.title'
  | 'stats.dialog.usageTitle'
  | 'stats.dialog.llmTime'
  | 'stats.dialog.toolTime'
  | 'stats.dialog.ttft'
  | 'stats.dialog.speed'
  | 'message.turnUsage.count'
  | 'message.turnUsage.cacheHit'
  | 'message.turnUsage.input'
  | 'message.turnUsage.cacheRead'
  | 'message.turnUsage.cacheWrite'
  | 'message.turnUsage.output'

export const en: Record<UsageStatsKey, string> = {
  nav: 'Usage statistics',
  back: 'Back',
  range: 'Time range',
  // Compact preset labels: the picker holds eight chips (seven spans + Custom),
  // and the spelled-out forms ("Last 14 days" ≈ 85px each) pushed the whole
  // toolbar past the panel's 960px column, so the button group wrapped onto a
  // second line. The Nd form is the standard range-picker convention and the
  // group carries `aria-label="Time range"`, so the shorthand is unambiguous.
  'rangePreset.today': 'Today',
  'rangePreset.3': '3d',
  'rangePreset.7': '7d',
  'rangePreset.14': '14d',
  'rangePreset.30': '30d',
  'rangePreset.90': '90d',
  'rangePreset.all': 'All',
  rangeCustom: 'Custom',
  from: 'From',
  to: 'To',
  refresh: 'Refresh',
  rebuild: 'Rebuild',
  rebuildConfirm: 'Rebuild?',
  rebuilding: 'Rebuilding',
  rebuildHint: 'Rebuild the statistics from session logs: clear the local cache and replay every session. Use it when the figures look wrong.',
  export: 'Export CSV',
  exportHint: 'Export this range as CSV: summary, daily, model, provider and session rows.',
  exportFailed: 'Export failed',
  autoRefresh: 'Auto refresh',
  autoRefreshHint: 'Refresh every 60 seconds while this page is visible; paused while it is hidden.',
  updatedAt: 'Updated at',
  loading: 'Loading',
  tokens: 'Token usage',
  tokensUnit: 'tokens',
  tokensHint: 'Provider-visible total: uncached input + output + cached tokens',
  cachedTokens: 'cached',
  // The row's rate is a bare percentage with a "cache" glyph in front: the row
  // already has three numeric columns, so a spelled-out label would cost more
  // width than the figure it introduces. The glyph carries the meaning, the
  // accessible label and the tooltip carry the words.
  hitRateShort: '{rate}',
  hitRateNone: '—',
  hitRateLabel: 'Cache hit rate',
  sessions: 'Sessions',
  sessionsHint: 'Sessions with at least one model call in the range; turns count completed turns only. Sessions whose logs were deleted cannot be reconstructed.',
  turnsShort: '{n} turns',
  requests: 'Requests',
  requestsShort: 'Requests',
  activeDays: 'Active days',
  cacheRate: 'Avg cache hit rate',
  cacheRateHint: 'Cached input tokens as a share of all input tokens in the range',
  comparePrev: 'vs previous period',
  cacheHitRate: 'Cache hit rate',
  hitRateLegend: 'Cache hit rate',
  topModel: 'Top model',
  topModelHint: 'Ranked by token volume, not call count',
  heatmap: 'Activity heatmap',
  heatLess: 'Less',
  heatMore: 'More',
  dailyTrend: 'Daily token trend',
  hourlyTrend: 'Hourly token trend',
  trendLimited: 'Showing the latest {n} days',
  sessionUsage: 'Session usage',
  sessionUsageHint: '{n} sessions · only conversations whose logs still exist',
  sessionTopModels: 'Model breakdown',
  sessionTruncated: 'Showing the top {shown} of {total} sessions',
  lastActive: 'Last active',
  noSessions: 'No sessions recorded in this range.',
  unknownRequests: '{n} requests without model attribution',
  modelUsage: 'Model usage',
  // The hints state only what the reader cannot infer from the rows themselves.
  // "Ranked by tokens" was carried by all three sections and is visible in the
  // descending token column; "hover a row to highlight it in the ring" described
  // an affordance the first hover demonstrates. Both came off, leaving the one
  // fact that is NOT visible: how many rows there are, and the coverage caveat.
  modelUsageHint: '{n} models',
  providerUsage: 'Provider usage',
  providerUsageHint: '{n} providers · open a row for its models',
  providerModels: '{n} models',
  other: 'Other',
  total: 'Total',
  percent: 'Share',
  asOf: 'As of',
  empty: 'No usage data in this time range yet. Token usage is recorded from the day the panel is installed, including a one-time scan of your existing sessions.',
  cachePrecision: 'Precise cache hit rate',
  cachePrecisionDesc: 'Show the cache hit rate with two decimals in the conversation bottom bar.',
  tokenDetail: 'Conversation token breakdown',
  tokenDetailDesc: 'Show total, cache hit/miss and output tokens in the conversation bottom bar.',
  streamThroughput: 'Streaming throughput',
  streamThroughputDesc: 'Show an estimated decode speed in the conversation bottom bar while a response streams, then the exact session figure once it settles.',
  'stats.counts': '{turns} turns · {steps} steps',
  'stats.tokensPerSecond': '{throughput} tok/s',
  'stats.cacheHit': 'Cache hit {percent}%',
  'stats.cacheMiss': 'Cache miss',
  'stats.dialog.title': 'Time & speed',
  'stats.dialog.usageTitle': 'Token usage',
  'stats.dialog.llmTime': 'LLM time',
  'stats.dialog.toolTime': 'Tool time',
  'stats.dialog.ttft': 'Mean TTFT',
  'stats.dialog.speed': 'Decode speed',
  'message.turnUsage.count': '{count} tok',
  'message.turnUsage.cacheHit': 'Cache hit',
  'message.turnUsage.input': 'Input',
  'message.turnUsage.cacheRead': 'Cache read',
  'message.turnUsage.cacheWrite': 'Cache write',
  'message.turnUsage.output': 'Output',
}

export const zh: Record<UsageStatsKey, string> = {
  nav: '使用统计',
  back: '返回',
  range: '时间范围',
  'rangePreset.today': '今日',
  'rangePreset.3': '3 天',
  'rangePreset.7': '7 天',
  'rangePreset.14': '14 天',
  'rangePreset.30': '30 天',
  'rangePreset.90': '90 天',
  'rangePreset.all': '全部',
  rangeCustom: '自定义',
  from: '开始日期',
  to: '结束日期',
  refresh: '刷新',
  rebuild: '重建统计',
  rebuildConfirm: '确认重建？',
  rebuilding: '重建中',
  rebuildHint: '按会话日志重建统计：清空本地统计缓存并重放全部会话。数字异常时使用。',
  export: '导出 CSV',
  exportHint: '导出当前时间范围的明细（CSV，含汇总、按天、模型、供应商、会话）。',
  exportFailed: '导出失败',
  autoRefresh: '自动刷新',
  autoRefreshHint: '页面可见时每 60 秒自动刷新一次；页面不可见时暂停。',
  updatedAt: '更新于',
  loading: '加载中',
  tokens: 'Tokens 用量',
  tokensUnit: 'tokens',
  tokensHint: '服务商总口径：未缓存输入 + 输出 + 缓存命中 token',
  cachedTokens: '缓存命中',
  hitRateShort: '{rate}',
  hitRateNone: '—',
  hitRateLabel: '缓存命中率',
  sessions: '会话数量',
  sessionsHint: '统计范围内有模型调用的会话数；轮次只计已完成的 turn。日志已删除的会话无法还原。',
  turnsShort: '{n} 轮',
  requests: '请求数量',
  requestsShort: '请求',
  activeDays: '活跃天数',
  cacheRate: '平均缓存命中率',
  cacheRateHint: '时间段内缓存命中 token 占输入 token 的比例',
  comparePrev: '较上期',
  cacheHitRate: '缓存命中率',
  hitRateLegend: '缓存命中率',
  topModel: '最常用模型',
  topModelHint: '按 token 用量排序，非调用次数',
  heatmap: '活跃热力图',
  heatLess: '较少',
  heatMore: '较多',
  dailyTrend: '按天 Token 趋势',
  hourlyTrend: '按小时 Token 趋势',
  trendLimited: '仅显示最近 {n} 天',
  sessionUsage: '会话用量',
  sessionUsageHint: '{n} 个会话 · 仅含日志仍存在的会话',
  sessionTopModels: '模型明细',
  sessionTruncated: '仅显示前 {shown} 个会话（共 {total} 个）',
  lastActive: '最后活跃',
  noSessions: '当前时间范围内没有会话记录。',
  unknownRequests: '{n} 个请求未归因到模型',
  modelUsage: '模型用量',
  modelUsageHint: '{n} 个模型',
  providerUsage: '各供应商用量',
  providerUsageHint: '{n} 个供应商 · 展开可见其模型',
  providerModels: '{n} 个模型',
  other: '其他',
  total: '总用量',
  percent: '占比',
  asOf: '统计截至',
  empty: '当前时间范围内暂无用量数据。Token 用量从本面板启用后开始累计，并会一次性回扫已有的历史会话。',
  cachePrecision: '精确缓存命中率',
  cachePrecisionDesc: '在会话底部信息栏以两位小数显示缓存命中率。',
  tokenDetail: '会话 Token 明细',
  tokenDetailDesc: '在会话底部信息栏显示总 Token、命中/未命中缓存与输出明细。',
  streamThroughput: '流式吞吐速度',
  streamThroughputDesc: '输出过程中在会话底部信息栏显示估算的解码速度，输出结束后回到会话累计的精确值。',
  'stats.counts': '{turns} 轮 · {steps} 步',
  'stats.tokensPerSecond': '{throughput} tok/s',
  'stats.cacheHit': '缓存命中 {percent}%',
  'stats.cacheMiss': '未命中缓存',
  'stats.dialog.title': '用时与速度',
  'stats.dialog.usageTitle': 'Token 用量',
  'stats.dialog.llmTime': 'LLM 用时',
  'stats.dialog.toolTime': '工具用时',
  'stats.dialog.ttft': '首 token 平均',
  'stats.dialog.speed': '解码速度',
  'message.turnUsage.count': '{count} tok',
  'message.turnUsage.cacheHit': '缓存命中',
  'message.turnUsage.input': '输入',
  'message.turnUsage.cacheRead': '缓存读取',
  'message.turnUsage.cacheWrite': '缓存写入',
  'message.turnUsage.output': '输出',
}

export const zhTW: Record<UsageStatsKey, string> = {
  nav: '使用統計',
  back: '返回',
  range: '時間範圍',
  'rangePreset.today': '今日',
  'rangePreset.3': '3 天',
  'rangePreset.7': '7 天',
  'rangePreset.14': '14 天',
  'rangePreset.30': '30 天',
  'rangePreset.90': '90 天',
  'rangePreset.all': '全部',
  rangeCustom: '自訂',
  from: '開始日期',
  to: '結束日期',
  refresh: '重新整理',
  rebuild: '重建統計',
  rebuildConfirm: '確認重建？',
  rebuilding: '重建中',
  rebuildHint: '依會話日誌重建統計：清空本機統計快取並重放全部會話。數字異常時使用。',
  export: '匯出 CSV',
  exportHint: '匯出目前時間範圍的明細（CSV，含彙總、每日、模型、供應商、會話）。',
  exportFailed: '匯出失敗',
  autoRefresh: '自動重新整理',
  autoRefreshHint: '頁面可見時每 60 秒自動重新整理一次；頁面不可見時暫停。',
  updatedAt: '更新於',
  loading: '載入中',
  tokens: 'Tokens 用量',
  tokensUnit: 'tokens',
  tokensHint: '服務商總口徑：未快取輸入 + 輸出 + 快取命中 token',
  cachedTokens: '快取命中',
  hitRateShort: '{rate}',
  hitRateNone: '—',
  hitRateLabel: '快取命中率',
  sessions: '會話數量',
  sessionsHint: '統計範圍內有模型呼叫的會話數；輪次只計已完成的 turn。日誌已刪除的會話無法還原。',
  turnsShort: '{n} 輪',
  requests: '請求數量',
  requestsShort: '請求',
  activeDays: '活躍天數',
  cacheRate: '平均快取命中率',
  cacheRateHint: '時間範圍內快取命中 token 佔輸入 token 的比例',
  comparePrev: '較上期',
  cacheHitRate: '快取命中率',
  hitRateLegend: '快取命中率',
  topModel: '最常用模型',
  topModelHint: '依 token 用量排序，非呼叫次數',
  heatmap: '活躍熱力圖',
  heatLess: '較少',
  heatMore: '較多',
  dailyTrend: '每日 Token 趨勢',
  hourlyTrend: '每小時 Token 趨勢',
  trendLimited: '僅顯示最近 {n} 天',
  sessionUsage: '會話用量',
  sessionUsageHint: '{n} 個會話 · 僅含日誌仍存在的會話',
  sessionTopModels: '模型明細',
  sessionTruncated: '僅顯示前 {shown} 個會話（共 {total} 個）',
  lastActive: '最後活躍',
  noSessions: '目前時間範圍內沒有會話紀錄。',
  unknownRequests: '{n} 個請求未歸因到模型',
  modelUsage: '模型用量',
  modelUsageHint: '{n} 個模型',
  providerUsage: '各供應商用量',
  providerUsageHint: '{n} 個供應商 · 展開可見其模型',
  providerModels: '{n} 個模型',
  other: '其他',
  total: '總用量',
  percent: '佔比',
  asOf: '統計截至',
  empty: '目前時間範圍內尚無用量資料。Token 用量自本面板啟用後開始累計，並會一次掃描既有的歷史會話。',
  cachePrecision: '精確快取命中率',
  cachePrecisionDesc: '在會話底部資訊欄以兩位小數顯示快取命中率。',
  tokenDetail: '會話 Token 明細',
  tokenDetailDesc: '在會話底部資訊欄顯示總 Token、命中/未命中快取與輸出明細。',
  streamThroughput: '串流吞吐速度',
  streamThroughputDesc: '輸出過程中在會話底部資訊欄顯示估算的解碼速度，輸出結束後回到會話累計的精確值。',
  'stats.counts': '{turns} 輪 · {steps} 步',
  'stats.tokensPerSecond': '{throughput} tok/s',
  'stats.cacheHit': '快取命中 {percent}%',
  'stats.cacheMiss': '未命中快取',
  'stats.dialog.title': '用時與速度',
  'stats.dialog.usageTitle': 'Token 用量',
  'stats.dialog.llmTime': 'LLM 用時',
  'stats.dialog.toolTime': '工具用時',
  'stats.dialog.ttft': '首 token 平均',
  'stats.dialog.speed': '解碼速度',
  'message.turnUsage.count': '{count} tok',
  'message.turnUsage.cacheHit': '快取命中',
  'message.turnUsage.input': '輸入',
  'message.turnUsage.cacheRead': '快取讀取',
  'message.turnUsage.cacheWrite': '快取寫入',
  'message.turnUsage.output': '輸出',
}

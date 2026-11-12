/**
 * Usage panel dictionaries, registered into the DSH locale service. The keys
 * mirror the reasonix stats locale block (settings.stats.*) plus the PR#7503
 * additions ("Other", 180-day trend note); values are the same Chinese and
 * English copy with the zh-TW variant transliterated.
 */
/** The locale namespace this plugin owns. */
export declare const LOCALE_NS = "usagePanelPlus";
/** The typed translator key union for the panel's locale seat. */
export type UsageStatsKey = 'nav' | 'back' | 'range' | 'rangePreset.today' | 'rangePreset.3' | 'rangePreset.7' | 'rangePreset.14' | 'rangePreset.30' | 'rangePreset.90' | 'rangePreset.all' | 'rangeCustom' | 'from' | 'to' | 'refresh' | 'retry' | 'customIncomplete' | 'rebuild' | 'rebuildConfirm' | 'rebuilding' | 'rebuildHint' | 'export' | 'exportHint' | 'exportFailed' | 'autoRefresh' | 'autoRefreshHint' | 'updatedAt' | 'loading' | 'tokens' | 'tokensHint' | 'tokensUnit' | 'cachedTokens' | 'hitRateShort' | 'hitRateNone' | 'hitRateLabel' | 'sessions' | 'sessionsHint' | 'turnsShort' | 'requests' | 'requestsShort' | 'activeDays' | 'cacheRate' | 'cacheRateHint' | 'comparePrev' | 'cacheHitRate' | 'hitRateLegend' | 'topModel' | 'topModelHint' | 'heatmap' | 'heatLess' | 'heatMore' | 'dailyTrend' | 'hourlyTrend' | 'trendLimited' | 'sessionUsage' | 'sessionUsageHint' | 'sessionTopModels' | 'sessionTruncated' | 'lastActive' | 'noSessions' | 'unknownRequests' | 'modelUsage' | 'modelUsageHint' | 'providerUsage' | 'providerUsageHint' | 'providerModels' | 'other' | 'total' | 'percent' | 'asOf' | 'empty' | 'cachePrecision' | 'cachePrecisionDesc' | 'tokenDetail' | 'tokenDetailDesc' | 'streamThroughput' | 'streamThroughputDesc' | 'stats.counts' | 'stats.tokensPerSecond' | 'stats.cacheHit' | 'stats.cacheMiss' | 'stats.dialog.title' | 'stats.dialog.usageTitle' | 'stats.dialog.llmTime' | 'stats.dialog.toolTime' | 'stats.dialog.ttft' | 'stats.dialog.speed' | 'message.turnUsage.count' | 'message.turnUsage.cacheHit' | 'message.turnUsage.input' | 'message.turnUsage.cacheRead' | 'message.turnUsage.cacheWrite' | 'message.turnUsage.output';
export declare const en: Record<UsageStatsKey, string>;
export declare const zh: Record<UsageStatsKey, string>;
export declare const zhTW: Record<UsageStatsKey, string>;

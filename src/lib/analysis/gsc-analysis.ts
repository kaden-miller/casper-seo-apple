import { ANALYSIS_THRESHOLDS } from "./constants";
import type {
  AnalysisFinding,
  GscPageMetricRow,
  GscQueryMetricRow,
  WebsiteAnalysisContext,
} from "./types";

function pageKey(row: GscPageMetricRow): string {
  return row.pageId ?? row.url;
}

function buildPreviousPageMap(rows: GscPageMetricRow[]) {
  const map = new Map<string, GscPageMetricRow>();
  for (const row of rows) {
    map.set(pageKey(row), row);
  }
  return map;
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 1 : 0;
  }
  return (current - previous) / previous;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function findHighImpressionLowCtrQueries(
  context: WebsiteAnalysisContext,
): AnalysisFinding[] {
  const {
    highImpressionMin,
    lowCtrMax,
    minQueryImpressions,
  } = ANALYSIS_THRESHOLDS;

  return context.currentQueryMetrics
    .filter(
      (row) =>
        row.impressions >= highImpressionMin &&
        row.ctr < lowCtrMax &&
        row.impressions >= minQueryImpressions,
    )
    .sort((a, b) => b.impressions - a.impressions)
    .map((row) => ({
      type: "high_impression_low_ctr" as const,
      category: "search_opportunity" as const,
      severity: row.impressions >= 500 ? "high" : "medium",
      title: row.query,
      description: `Query has ${row.impressions.toLocaleString()} impressions but only ${formatPercent(row.ctr)} CTR.`,
      query: row.query,
      pageId: row.pageId,
      url: row.url,
      metrics: {
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: formatPercent(row.ctr),
        avgPosition: row.avgPosition.toFixed(1),
      },
    }));
}

export function findPageClickDeclines(
  context: WebsiteAnalysisContext,
): AnalysisFinding[] {
  const { clickDeclineMinPreviousClicks, clickDeclinePercent } =
    ANALYSIS_THRESHOLDS;
  const previousByKey = buildPreviousPageMap(context.previousPageMetrics);
  const findings: AnalysisFinding[] = [];

  for (const current of context.currentPageMetrics) {
    const previous = previousByKey.get(pageKey(current));
    if (!previous) {
      continue;
    }

    if (previous.clicks < clickDeclineMinPreviousClicks) {
      continue;
    }

    const change = percentChange(current.clicks, previous.clicks);
    if (change > -clickDeclinePercent) {
      continue;
    }

    findings.push({
      type: "page_click_decline",
      category: "search_performance",
      severity: change <= -0.4 ? "high" : "medium",
      title: current.url,
      description: `Clicks fell from ${previous.clicks.toLocaleString()} to ${current.clicks.toLocaleString()} (${formatPercent(change)}).`,
      pageId: current.pageId,
      url: current.url,
      metrics: {
        currentClicks: current.clicks,
        previousClicks: previous.clicks,
        change: formatPercent(change),
        currentImpressions: current.impressions,
        previousImpressions: previous.impressions,
      },
    });
  }

  return findings.sort(
    (a, b) =>
      Number(a.metrics.currentClicks) -
      Number(a.metrics.previousClicks) -
      (Number(b.metrics.currentClicks) - Number(b.metrics.previousClicks)),
  );
}

export function findPageImpressionGrowthWeakClicks(
  context: WebsiteAnalysisContext,
): AnalysisFinding[] {
  const {
    impressionGrowthMinPrevious,
    impressionGrowthPercent,
    weakClickGrowthPercent,
  } = ANALYSIS_THRESHOLDS;
  const previousByKey = buildPreviousPageMap(context.previousPageMetrics);
  const findings: AnalysisFinding[] = [];

  for (const current of context.currentPageMetrics) {
    const previous = previousByKey.get(pageKey(current));
    if (!previous) {
      continue;
    }

    if (previous.impressions < impressionGrowthMinPrevious) {
      continue;
    }

    const impressionChange = percentChange(
      current.impressions,
      previous.impressions,
    );
    const clickChange = percentChange(current.clicks, previous.clicks);

    if (impressionChange < impressionGrowthPercent) {
      continue;
    }

    if (clickChange >= weakClickGrowthPercent) {
      continue;
    }

    findings.push({
      type: "page_impression_growth_weak_clicks",
      category: "search_opportunity",
      severity: impressionChange >= 0.5 ? "high" : "medium",
      title: current.url,
      description: `Impressions grew ${formatPercent(impressionChange)} while clicks only changed ${formatPercent(clickChange)}.`,
      pageId: current.pageId,
      url: current.url,
      metrics: {
        impressionChange: formatPercent(impressionChange),
        clickChange: formatPercent(clickChange),
        currentImpressions: current.impressions,
        previousImpressions: previous.impressions,
        currentClicks: current.clicks,
        previousClicks: previous.clicks,
      },
    });
  }

  return findings.sort(
    (a, b) =>
      Number(b.metrics.currentImpressions) -
      Number(a.metrics.currentImpressions),
  );
}

function findQueriesInRankingBand(
  queries: GscQueryMetricRow[],
  min: number,
  max: number,
  type: "query_ranking_4_15" | "query_ranking_16_30",
): AnalysisFinding[] {
  const { minRankingQueryImpressions } = ANALYSIS_THRESHOLDS;

  return queries
    .filter(
      (row) =>
        row.avgPosition >= min &&
        row.avgPosition <= max &&
        row.impressions >= minRankingQueryImpressions,
    )
    .sort((a, b) => b.impressions - a.impressions)
    .map((row) => ({
      type,
      category: "search_opportunity" as const,
      severity: type === "query_ranking_4_15" ? "high" : "medium",
      title: row.query,
      description: `Average position ${row.avgPosition.toFixed(1)} with ${row.impressions.toLocaleString()} impressions.`,
      query: row.query,
      pageId: row.pageId,
      url: row.url,
      metrics: {
        avgPosition: row.avgPosition.toFixed(1),
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: formatPercent(row.ctr),
      },
    }));
}

export function findQueriesRanking4To15(
  context: WebsiteAnalysisContext,
): AnalysisFinding[] {
  const { rankingBand4to15Min, rankingBand4to15Max } = ANALYSIS_THRESHOLDS;
  return findQueriesInRankingBand(
    context.currentQueryMetrics,
    rankingBand4to15Min,
    rankingBand4to15Max,
    "query_ranking_4_15",
  );
}

export function findQueriesRanking16To30(
  context: WebsiteAnalysisContext,
): AnalysisFinding[] {
  const { rankingBand16to30Min, rankingBand16to30Max } = ANALYSIS_THRESHOLDS;
  return findQueriesInRankingBand(
    context.currentQueryMetrics,
    rankingBand16to30Min,
    rankingBand16to30Max,
    "query_ranking_16_30",
  );
}

export function runGscAnalysis(context: WebsiteAnalysisContext): AnalysisFinding[] {
  return [
    ...findHighImpressionLowCtrQueries(context),
    ...findPageClickDeclines(context),
    ...findPageImpressionGrowthWeakClicks(context),
    ...findQueriesRanking4To15(context),
    ...findQueriesRanking16To30(context),
  ];
}

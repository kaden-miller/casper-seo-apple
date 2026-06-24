import { loadWebsiteAnalysisContext } from "@/lib/analysis/context";
import { runGscAnalysis } from "@/lib/analysis/gsc-analysis";
import { ga4Repository } from "@/lib/repositories/ga4";

const QUERY_LIMIT = 40;
const PAGE_LIMIT = 40;

export async function buildSearchPerformanceInput(websiteId: string) {
  const context = await loadWebsiteAnalysisContext(websiteId);
  const ga4Summary = await ga4Repository.getDashboardSummary(websiteId);

  const gscFindings = runGscAnalysis(context).slice(0, 50);

  const topQueries = [...context.currentQueryMetrics]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, QUERY_LIMIT);

  const topPages = [...context.currentPageMetrics]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, PAGE_LIMIT);

  const previousPagesByUrl = new Map(
    context.previousPageMetrics.map((row) => [row.url, row]),
  );

  const pageComparisons = topPages.map((current) => {
    const previous = previousPagesByUrl.get(current.url);
    return {
      ...current,
      previousClicks: previous?.clicks ?? null,
      previousImpressions: previous?.impressions ?? null,
      previousCtr: previous?.ctr ?? null,
      previousAvgPosition: previous?.avgPosition ?? null,
    };
  });

  return {
    dateRanges: {
      current: context.currentRange,
      previous: context.previousRange,
    },
    gscTopQueries: topQueries,
    gscTopPages: pageComparisons,
    ga4TopLandingPages: ga4Summary.topLandingPages,
    ga4Summary: {
      current: ga4Summary.current,
      previous: ga4Summary.previous,
    },
    deterministicFindings: gscFindings,
    instruction:
      "Use GSC and GA4 metrics plus deterministicFindings as evidence. Focus on CTR opportunities, click declines, and ranking bands.",
  };
}

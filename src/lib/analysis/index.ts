import { loadWebsiteAnalysisContext } from "./context";
import { runCrawlAnalysis } from "./crawl-analysis";
import { runGscAnalysis } from "./gsc-analysis";
import type {
  AnalysisFinding,
  AnalysisFindingType,
  WebsiteAnalysisResult,
} from "./types";

function buildSummary(findings: AnalysisFinding[]) {
  const byType = {} as Record<AnalysisFindingType, number>;

  for (const finding of findings) {
    byType[finding.type] = (byType[finding.type] ?? 0) + 1;
  }

  return {
    total: findings.length,
    high: findings.filter((finding) => finding.severity === "high").length,
    medium: findings.filter((finding) => finding.severity === "medium").length,
    low: findings.filter((finding) => finding.severity === "low").length,
    byType,
  };
}

export async function runWebsiteAnalysis(
  websiteId: string,
): Promise<WebsiteAnalysisResult> {
  const context = await loadWebsiteAnalysisContext(websiteId);
  const findings = [...runGscAnalysis(context), ...runCrawlAnalysis(context)];

  return {
    websiteId,
    generatedAt: new Date(),
    currentRange: context.currentRange,
    previousRange: context.previousRange,
    findings,
    summary: buildSummary(findings),
  };
}

export { loadWebsiteAnalysisContext } from "./context";
export { runGscAnalysis } from "./gsc-analysis";
export { runCrawlAnalysis } from "./crawl-analysis";
export type * from "./types";
export { ANALYSIS_FINDING_LABELS, ANALYSIS_THRESHOLDS } from "./constants";

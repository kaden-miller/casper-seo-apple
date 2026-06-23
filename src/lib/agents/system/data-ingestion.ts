import { prisma } from "@/lib/db";
import { integrationRepository } from "@/lib/repositories/integrations";
import { pageRepository } from "@/lib/repositories/pages";

const STALE_DAYS = 35;

function daysSince(date: Date | null | undefined): number | null {
  if (!date) {
    return null;
  }

  const ms = Date.now() - date.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export async function runDataIngestionSystemAgent(
  websiteId: string,
  _input: Record<string, unknown>,
): Promise<string> {
  const [gscIntegration, ga4Integration, crawlRuns, latestGscRun, latestGa4Run] =
    await Promise.all([
      integrationRepository.getByType(websiteId, "GSC"),
      integrationRepository.getByType(websiteId, "GA4"),
      pageRepository.listCrawlRuns(websiteId),
      prisma.integrationRun.findFirst({
        where: { websiteId, type: "GSC", status: "SUCCESS" },
        orderBy: { finishedAt: "desc" },
      }),
      prisma.integrationRun.findFirst({
        where: { websiteId, type: "GA4", status: "SUCCESS" },
        orderBy: { finishedAt: "desc" },
      }),
    ]);

  const warnings: Array<{
    source: string;
    message: string;
    severity: "low" | "medium" | "high";
  }> = [];
  const recommendedActions: string[] = [];

  const latestCrawl = crawlRuns[0] ?? null;
  const crawlAge = daysSince(latestCrawl?.finishedAt ?? latestCrawl?.startedAt);

  if (!latestCrawl) {
    warnings.push({
      source: "crawler",
      message: "Website has not been crawled yet.",
      severity: "high",
    });
    recommendedActions.push("Run a website crawl");
  } else if (latestCrawl.status === "FAILED") {
    warnings.push({
      source: "crawler",
      message: `Latest crawl failed: ${latestCrawl.errorMessage ?? "unknown error"}`,
      severity: "high",
    });
    recommendedActions.push("Re-run the website crawl");
  } else if (crawlAge != null && crawlAge > STALE_DAYS) {
    warnings.push({
      source: "crawler",
      message: `Website crawl is ${crawlAge} days old.`,
      severity: "medium",
    });
    recommendedActions.push("Refresh crawl data");
  }

  if (!gscIntegration || gscIntegration.status === "DISCONNECTED") {
    warnings.push({
      source: "gsc",
      message: "Google Search Console is not connected.",
      severity: "high",
    });
    recommendedActions.push("Connect and sync Google Search Console");
  } else if (!latestGscRun) {
    warnings.push({
      source: "gsc",
      message: "No successful GSC sync has been recorded.",
      severity: "high",
    });
    recommendedActions.push("Sync GSC data");
  } else {
    const gscAge = daysSince(gscIntegration.lastSyncedAt);
    if (gscAge != null && gscAge > STALE_DAYS) {
      warnings.push({
        source: "gsc",
        message: `GSC data is ${gscAge} days old.`,
        severity: "medium",
      });
      recommendedActions.push("Re-sync GSC data");
    }
  }

  if (!ga4Integration || ga4Integration.status === "DISCONNECTED") {
    warnings.push({
      source: "ga4",
      message: "Google Analytics 4 is not connected.",
      severity: "medium",
    });
    recommendedActions.push("Connect and sync GA4");
  } else if (!latestGa4Run) {
    warnings.push({
      source: "ga4",
      message: "No successful GA4 sync has been recorded.",
      severity: "medium",
    });
    recommendedActions.push("Sync GA4 data");
  }

  const summary =
    warnings.length === 0
      ? "Required data sources appear current enough for SEO analysis."
      : `${warnings.length} data freshness issue(s) detected.`;

  return JSON.stringify(
    {
      summary,
      warnings,
      recommendedActions,
    },
    null,
    2,
  );
}

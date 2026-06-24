import { loadWebsiteAnalysisContext } from "@/lib/analysis/context";
import { runCrawlAnalysis } from "@/lib/analysis/crawl-analysis";
import { pageRepository } from "@/lib/repositories/pages";

const PAGE_LIMIT = 40;

export async function buildTechnicalSeoInput(websiteId: string) {
  const [context, crawlRuns, pages] = await Promise.all([
    loadWebsiteAnalysisContext(websiteId),
    pageRepository.listCrawlRuns(websiteId),
    pageRepository.listWithLatestSnapshot(websiteId),
  ]);

  const technicalFindings = runCrawlAnalysis(context).slice(0, 50);
  const latestCrawl = crawlRuns[0] ?? null;

  const crawlPages = pages.slice(0, PAGE_LIMIT).map((page) => {
    const snapshot = page.snapshots[0];
    return {
      pageId: page.id,
      url: page.url,
      status: page.status,
      statusCode: snapshot?.statusCode ?? null,
      title: snapshot?.title ?? null,
      metaDescription: snapshot?.metaDescription ?? null,
      h1: snapshot?.h1 ?? null,
      canonicalUrl: snapshot?.canonicalUrl ?? null,
      robotsMeta: snapshot?.robotsMeta ?? null,
      wordCount: snapshot?.wordCount ?? null,
      imagesMissingAltCount: snapshot?.imagesMissingAltCount ?? null,
      schemaTypes: snapshot?.schemaTypes ?? [],
    };
  });

  return {
    latestCrawl: latestCrawl
      ? {
          id: latestCrawl.id,
          status: latestCrawl.status,
          pagesCrawled: latestCrawl.pagesCrawled,
          finishedAt: latestCrawl.finishedAt,
          errorMessage: latestCrawl.errorMessage,
        }
      : null,
    crawlPages,
    deterministicFindings: technicalFindings,
    instruction:
      "Use crawlPages and deterministicFindings as evidence. Do not invent URLs or issues not supported by this data.",
  };
}

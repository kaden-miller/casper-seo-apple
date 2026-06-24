import { prisma } from "@/lib/db";
import { loadWebsiteAnalysisContext } from "@/lib/analysis/context";
import { requireOrganization } from "@/lib/repositories/base";
import { pageRepository } from "@/lib/repositories/pages";
import { websiteRepository } from "@/lib/repositories/websites";

const PAGE_LIMIT = 30;
const QUERY_PAGE_LIMIT = 50;

export async function buildOnPageSeoInput(websiteId: string) {
  const organization = await requireOrganization();
  const [website, pages, context] = await Promise.all([
    websiteRepository.getById(websiteId),
    pageRepository.listWithLatestSnapshot(websiteId),
    loadWebsiteAnalysisContext(websiteId),
  ]);

  if (!website) {
    throw new Error("Website not found");
  }

  const queryPagePairs =
    context.currentRange &&
    (await prisma.gscQueryPageSnapshot.findMany({
      where: {
        websiteId,
        dateStart: context.currentRange.dateStart,
        dateEnd: context.currentRange.dateEnd,
        website: { client: { organizationId: organization.id } },
      },
      orderBy: { impressions: "desc" },
      take: QUERY_PAGE_LIMIT,
      select: {
        query: true,
        url: true,
        clicks: true,
        impressions: true,
        ctr: true,
        avgPosition: true,
      },
    }));

  const crawlPages = pages.slice(0, PAGE_LIMIT).map((page) => {
    const snapshot = page.snapshots[0];
    return {
      pageId: page.id,
      url: page.url,
      targetKeyword: page.targetKeyword,
      searchIntent: page.searchIntent,
      title: snapshot?.title ?? null,
      metaDescription: snapshot?.metaDescription ?? null,
      h1: snapshot?.h1 ?? null,
      h2s: snapshot?.h2s ?? [],
      wordCount: snapshot?.wordCount ?? null,
    };
  });

  return {
    targetServices: website.targetServices,
    serviceAreas: website.serviceAreas,
    keywords: website.keywords.map((keyword) => ({
      id: keyword.id,
      keyword: keyword.keyword,
      priority: keyword.priority,
      device: keyword.device,
      location: keyword.location,
    })),
    crawlPages,
    gscQueryPagePairs: queryPagePairs ?? [],
    instruction:
      "Align on-page recommendations with target keywords, crawl data, and GSC query/page pairs. Do not invent page content.",
  };
}

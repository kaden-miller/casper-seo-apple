import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";
import type {
  AnalysisDateRange,
  CrawlPageRow,
  GscPageMetricRow,
  GscQueryMetricRow,
  WebsiteAnalysisContext,
} from "./types";

async function getLatestGscRanges(
  websiteId: string,
  organizationId: string,
): Promise<AnalysisDateRange[]> {
  const ranges = await prisma.gscPageSnapshot.findMany({
    where: {
      websiteId,
      website: organizationWebsiteFilter(organizationId),
    },
    select: { dateStart: true, dateEnd: true },
    distinct: ["dateStart", "dateEnd"],
    orderBy: { dateEnd: "desc" },
    take: 2,
  });

  return ranges;
}

async function loadGscPageMetrics(
  websiteId: string,
  organizationId: string,
  range: AnalysisDateRange,
): Promise<GscPageMetricRow[]> {
  const rows = await prisma.gscPageSnapshot.findMany({
    where: {
      websiteId,
      dateStart: range.dateStart,
      dateEnd: range.dateEnd,
      website: organizationWebsiteFilter(organizationId),
    },
    select: {
      pageId: true,
      url: true,
      clicks: true,
      impressions: true,
      ctr: true,
      avgPosition: true,
    },
  });

  return rows;
}

async function loadGscQueryMetrics(
  websiteId: string,
  organizationId: string,
  range: AnalysisDateRange,
): Promise<GscQueryMetricRow[]> {
  const rows = await prisma.gscQuerySnapshot.findMany({
    where: {
      websiteId,
      dateStart: range.dateStart,
      dateEnd: range.dateEnd,
      website: organizationWebsiteFilter(organizationId),
    },
    select: {
      query: true,
      pageId: true,
      url: true,
      clicks: true,
      impressions: true,
      ctr: true,
      avgPosition: true,
    },
  });

  return rows;
}

async function loadCrawlPages(
  websiteId: string,
  organizationId: string,
): Promise<CrawlPageRow[]> {
  const pages = await prisma.page.findMany({
    where: {
      websiteId,
      website: organizationWebsiteFilter(organizationId),
    },
    select: {
      id: true,
      url: true,
      normalizedUrl: true,
      snapshots: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          title: true,
          metaDescription: true,
          h1: true,
          wordCount: true,
          imagesMissingAltCount: true,
          imageCount: true,
        },
      },
    },
    orderBy: { url: "asc" },
  });

  return pages
    .filter((page) => page.snapshots[0])
    .map((page) => {
      const snapshot = page.snapshots[0]!;
      return {
        pageId: page.id,
        url: page.url,
        normalizedUrl: page.normalizedUrl,
        title: snapshot.title,
        metaDescription: snapshot.metaDescription,
        h1: snapshot.h1,
        wordCount: snapshot.wordCount,
        imagesMissingAltCount: snapshot.imagesMissingAltCount,
        imageCount: snapshot.imageCount,
      };
    });
}

export async function loadWebsiteAnalysisContext(
  websiteId: string,
): Promise<WebsiteAnalysisContext> {
  const organization = await requireOrganization();
  const ranges = await getLatestGscRanges(websiteId, organization.id);
  const currentRange = ranges[0] ?? null;
  const previousRange = ranges[1] ?? null;

  const [
    currentPageMetrics,
    previousPageMetrics,
    currentQueryMetrics,
    crawlPages,
  ] = await Promise.all([
    currentRange
      ? loadGscPageMetrics(websiteId, organization.id, currentRange)
      : Promise.resolve([]),
    previousRange
      ? loadGscPageMetrics(websiteId, organization.id, previousRange)
      : Promise.resolve([]),
    currentRange
      ? loadGscQueryMetrics(websiteId, organization.id, currentRange)
      : Promise.resolve([]),
    loadCrawlPages(websiteId, organization.id),
  ]);

  return {
    websiteId,
    currentRange,
    previousRange,
    currentPageMetrics,
    previousPageMetrics,
    currentQueryMetrics,
    crawlPages,
  };
}

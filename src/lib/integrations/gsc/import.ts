import type { Integration } from "@/generated/prisma/client";
import { normalizeUrl } from "@/lib/crawler/url-utils";
import { prisma } from "@/lib/db";
import {
  encryptedTokensFromCredentials,
  getAuthenticatedGoogleClient,
} from "@/lib/integrations/google/oauth";
import {
  formatGscApiError,
  queryGscSearchAnalytics,
} from "@/lib/integrations/gsc/client";
import { getGscImportDateRanges } from "@/lib/integrations/gsc/date-ranges";
import type { GscDimension } from "@/lib/integrations/gsc/types";

export type GscImportResult = {
  runId: string;
  recordsImported: number;
  dateStart: Date;
  dateEnd: Date;
};

async function buildPageIdLookup(websiteId: string) {
  const pages = await prisma.page.findMany({
    where: { websiteId },
    select: { id: true, normalizedUrl: true, url: true },
  });

  const lookup = new Map<string, string>();
  for (const page of pages) {
    lookup.set(page.normalizedUrl, page.id);
    const normalizedFromUrl = normalizeUrl(page.url);
    if (normalizedFromUrl) {
      lookup.set(normalizedFromUrl, page.id);
    }
  }

  return lookup;
}

function resolvePageId(
  lookup: Map<string, string>,
  pageUrl: string | undefined,
): { pageId: string | null; url: string | null } {
  if (!pageUrl) {
    return { pageId: null, url: null };
  }

  const normalized = normalizeUrl(pageUrl);
  if (!normalized) {
    return { pageId: null, url: pageUrl };
  }

  return {
    pageId: lookup.get(normalized) ?? null,
    url: normalized,
  };
}

async function importDimensionForRange(
  integration: Integration,
  dimension: GscDimension,
  startDate: string,
  endDate: string,
  rangeStart: Date,
  rangeEnd: Date,
  pageLookup: Map<string, string>,
): Promise<number> {
  if (!integration.siteUrl) {
    throw new Error("Search Console property is not selected");
  }

  const { client, refreshedCredentials } =
    await getAuthenticatedGoogleClient(integration);

  if (refreshedCredentials) {
    const encrypted = encryptedTokensFromCredentials(refreshedCredentials);
    await prisma.integration.update({
      where: { id: integration.id },
      data: encrypted,
    });
  }

  const rows = await queryGscSearchAnalytics(
    client,
    integration.siteUrl,
    dimension,
    startDate,
    endDate,
  );

  if (dimension === "page") {
    await prisma.gscPageSnapshot.createMany({
      data: rows.map((row) => {
        const { pageId, url } = resolvePageId(pageLookup, row.page);
        return {
          websiteId: integration.websiteId,
          pageId,
          url: url ?? row.page ?? "",
          dateStart: rangeStart,
          dateEnd: rangeEnd,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          avgPosition: row.position,
        };
      }),
    });
  } else if (dimension === "query") {
    await prisma.gscQuerySnapshot.createMany({
      data: rows.map((row) => ({
        websiteId: integration.websiteId,
        query: row.query ?? "",
        dateStart: rangeStart,
        dateEnd: rangeEnd,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        avgPosition: row.position,
      })),
    });
  } else {
    await prisma.gscQueryPageSnapshot.createMany({
      data: rows.map((row) => {
        const { pageId, url } = resolvePageId(pageLookup, row.page);
        return {
          websiteId: integration.websiteId,
          query: row.query ?? "",
          pageId,
          url: url ?? row.page ?? "",
          dateStart: rangeStart,
          dateEnd: rangeEnd,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          avgPosition: row.position,
        };
      }),
    });
  }

  return rows.length;
}

export async function importGscDataForWebsite(
  integration: Integration,
): Promise<GscImportResult> {
  if (!integration.siteUrl) {
    throw new Error("Select a Search Console property before syncing");
  }

  const ranges = getGscImportDateRanges();
  const dimensions: GscDimension[] = ["page", "query", "query_page"];
  const dateStart = ranges[1]!.start;
  const dateEnd = ranges[0]!.end;

  const run = await prisma.integrationRun.create({
    data: {
      integrationId: integration.id,
      websiteId: integration.websiteId,
      type: "GSC",
      status: "RUNNING",
      dateStart,
      dateEnd,
      startedAt: new Date(),
    },
  });

  try {
    const pageLookup = await buildPageIdLookup(integration.websiteId);
    let recordsImported = 0;

    for (const range of ranges) {
      for (const dimension of dimensions) {
        recordsImported += await importDimensionForRange(
          integration,
          dimension,
          range.startDate,
          range.endDate,
          range.start,
          range.end,
          pageLookup,
        );
      }
    }

    await prisma.integrationRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        recordsImported,
        finishedAt: new Date(),
      },
    });

    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: "CONNECTED",
        lastSyncedAt: new Date(),
      },
    });

    return {
      runId: run.id,
      recordsImported,
      dateStart,
      dateEnd,
    };
  } catch (error) {
    const message = formatGscApiError(error);

    await prisma.integrationRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        errorMessage: message,
        finishedAt: new Date(),
      },
    });

    await prisma.integration.update({
      where: { id: integration.id },
      data: { status: "ERROR" },
    });

    throw new Error(message);
  }
}

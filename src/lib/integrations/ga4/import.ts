import type { Integration } from "@/generated/prisma/client";
import { normalizeUrl } from "@/lib/crawler/url-utils";
import { prisma } from "@/lib/db";
import {
  encryptedTokensFromCredentials,
  getAuthenticatedGoogleClient,
} from "@/lib/integrations/google/oauth";
import {
  formatGa4ApiError,
  queryOrganicLandingPages,
} from "@/lib/integrations/ga4/client";
import { getGscImportDateRanges } from "@/lib/integrations/gsc/date-ranges";

export type Ga4ImportResult = {
  runId: string;
  recordsImported: number;
  dateStart: Date;
  dateEnd: Date;
};

function normalizeLandingPagePath(path: string): string {
  if (!path || path === "(not set)") {
    return path;
  }

  let normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

async function buildPageLookup(websiteId: string, websiteUrl: string) {
  const pages = await prisma.page.findMany({
    where: { websiteId },
    select: { id: true, normalizedUrl: true, url: true },
  });

  const lookup = new Map<string, { pageId: string; url: string }>();

  function addPathKey(path: string, pageId: string, url: string) {
    const normalizedPath = normalizeLandingPagePath(path);
    lookup.set(normalizedPath, { pageId, url });
    lookup.set(`${normalizedPath}/`, { pageId, url });
  }

  for (const page of pages) {
    for (const candidate of [page.normalizedUrl, page.url]) {
      try {
        const pathname = new URL(candidate).pathname;
        addPathKey(pathname, page.id, page.normalizedUrl);
      } catch {
        // ignore invalid URLs
      }
    }
  }

  let websiteOrigin: string | null = null;
  try {
    websiteOrigin = new URL(websiteUrl).origin;
  } catch {
    websiteOrigin = null;
  }

  return { lookup, websiteOrigin };
}

function resolvePageForPath(
  lookup: Map<string, { pageId: string; url: string }>,
  websiteOrigin: string | null,
  path: string,
): { pageId: string | null; url: string | null } {
  const normalizedPath = normalizeLandingPagePath(path);
  const match = lookup.get(normalizedPath) ?? lookup.get(`${normalizedPath}/`);

  if (match) {
    return { pageId: match.pageId, url: match.url };
  }

  if (websiteOrigin && normalizedPath.startsWith("/")) {
    const fullUrl = normalizeUrl(`${websiteOrigin}${normalizedPath}`);
    return { pageId: null, url: fullUrl };
  }

  return { pageId: null, url: normalizedPath };
}

async function importRange(
  integration: Integration,
  websiteUrl: string,
  startDate: string,
  endDate: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<number> {
  if (!integration.propertyId) {
    throw new Error("GA4 property is not selected");
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

  const rows = await queryOrganicLandingPages(
    client,
    integration.propertyId,
    startDate,
    endDate,
  );

  const { lookup, websiteOrigin } = await buildPageLookup(
    integration.websiteId,
    websiteUrl,
  );

  await prisma.ga4LandingPageSnapshot.createMany({
    data: rows.map((row) => {
      const { pageId, url } = resolvePageForPath(
        lookup,
        websiteOrigin,
        row.path,
      );

      return {
        websiteId: integration.websiteId,
        pageId,
        path: normalizeLandingPagePath(row.path),
        url,
        dateStart: rangeStart,
        dateEnd: rangeEnd,
        sessions: row.sessions,
        users: row.users,
        engagedSessions: row.engagedSessions,
        engagementRate: row.engagementRate,
        averageEngagementTime: row.averageEngagementTime,
        conversions: row.conversions,
        revenue: row.revenue,
      };
    }),
  });

  return rows.length;
}

export async function importGa4DataForWebsite(
  integration: Integration,
  websiteUrl: string,
): Promise<Ga4ImportResult> {
  if (!integration.propertyId) {
    throw new Error("Select a GA4 property before syncing");
  }

  const ranges = getGscImportDateRanges();
  const dateStart = ranges[1]!.start;
  const dateEnd = ranges[0]!.end;

  const run = await prisma.integrationRun.create({
    data: {
      integrationId: integration.id,
      websiteId: integration.websiteId,
      type: "GA4",
      status: "RUNNING",
      dateStart,
      dateEnd,
      startedAt: new Date(),
    },
  });

  try {
    let recordsImported = 0;

    for (const range of ranges) {
      recordsImported += await importRange(
        integration,
        websiteUrl,
        range.startDate,
        range.endDate,
        range.start,
        range.end,
      );
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
    const message = formatGa4ApiError(error);

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

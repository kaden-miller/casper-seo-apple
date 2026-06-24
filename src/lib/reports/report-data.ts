import { prisma } from "@/lib/db";
import type { Ga4PeriodSummary } from "@/lib/repositories/ga4";
import type { GscPeriodSummary } from "@/lib/repositories/gsc";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";
import {
  formatMonthLabel,
  getMonthPeriod,
  type MonthPeriod,
} from "@/lib/reports/month-period";
import type {
  MonthlyReportStructuredData,
  ReportPageMovement,
  ReportPerformanceMetric,
  ReportRecommendationSnapshot,
  ReportTaskSnapshot,
} from "@/lib/reports/types";

type PageAggregate = {
  url: string;
  pageId: string | null;
  clicks: number;
  impressions: number;
  weightedPosition: number;
};

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function buildGscMetrics(
  current: GscPeriodSummary | null,
  previous: GscPeriodSummary | null,
): ReportPerformanceMetric[] {
  if (!current) {
    return [];
  }

  return [
    {
      label: "Organic clicks",
      current: current.clicks,
      previous: previous?.clicks ?? null,
      deltaPercent:
        previous != null
          ? deltaPercent(current.clicks, previous.clicks)
          : null,
    },
    {
      label: "Organic impressions",
      current: current.impressions,
      previous: previous?.impressions ?? null,
      deltaPercent:
        previous != null
          ? deltaPercent(current.impressions, previous.impressions)
          : null,
    },
    {
      label: "Average CTR",
      current: current.ctr,
      previous: previous?.ctr ?? null,
      deltaPercent:
        previous != null ? deltaPercent(current.ctr, previous.ctr) : null,
    },
    {
      label: "Average position",
      current: current.avgPosition,
      previous: previous?.avgPosition ?? null,
      deltaPercent:
        previous != null
          ? deltaPercent(current.avgPosition, previous.avgPosition)
          : null,
    },
  ];
}

function buildGa4Metrics(
  current: Ga4PeriodSummary | null,
  previous: Ga4PeriodSummary | null,
): ReportPerformanceMetric[] {
  if (!current) {
    return [];
  }

  return [
    {
      label: "Organic sessions",
      current: current.sessions,
      previous: previous?.sessions ?? null,
      deltaPercent:
        previous != null
          ? deltaPercent(current.sessions, previous.sessions)
          : null,
    },
    {
      label: "Organic users",
      current: current.users,
      previous: previous?.users ?? null,
      deltaPercent:
        previous != null ? deltaPercent(current.users, previous.users) : null,
    },
    {
      label: "Conversions",
      current: current.conversions,
      previous: previous?.conversions ?? null,
      deltaPercent:
        previous != null
          ? deltaPercent(current.conversions, previous.conversions)
          : null,
    },
    {
      label: "Engagement rate",
      current: current.engagementRate,
      previous: previous?.engagementRate ?? null,
      deltaPercent:
        previous != null
          ? deltaPercent(current.engagementRate, previous.engagementRate)
          : null,
    },
  ];
}

async function aggregateGscPages(
  websiteId: string,
  organizationId: string,
  dateStart: Date,
  dateEnd: Date,
): Promise<Map<string, PageAggregate>> {
  const snapshots = await prisma.gscPageSnapshot.findMany({
    where: {
      websiteId,
      dateStart,
      dateEnd,
      website: organizationWebsiteFilter(organizationId),
    },
    select: {
      url: true,
      pageId: true,
      clicks: true,
      impressions: true,
      avgPosition: true,
    },
  });

  const byUrl = new Map<string, PageAggregate>();

  for (const row of snapshots) {
    const existing = byUrl.get(row.url) ?? {
      url: row.url,
      pageId: row.pageId,
      clicks: 0,
      impressions: 0,
      weightedPosition: 0,
    };

    existing.clicks += row.clicks;
    existing.impressions += row.impressions;
    existing.weightedPosition += row.avgPosition * row.impressions;
    if (!existing.pageId && row.pageId) {
      existing.pageId = row.pageId;
    }

    byUrl.set(row.url, existing);
  }

  return byUrl;
}

function buildPageMovements(
  currentPages: Map<string, PageAggregate>,
  previousPages: Map<string, PageAggregate>,
): ReportPageMovement[] {
  const urls = new Set([...currentPages.keys(), ...previousPages.keys()]);
  const movements: ReportPageMovement[] = [];

  for (const url of urls) {
    const current = currentPages.get(url);
    const previous = previousPages.get(url);
    const clicksCurrent = current?.clicks ?? 0;
    const clicksPrevious = previous?.clicks ?? 0;
    const impressionsCurrent = current?.impressions ?? 0;
    const impressionsPrevious = previous?.impressions ?? 0;
    const positionCurrent =
      current && current.impressions > 0
        ? current.weightedPosition / current.impressions
        : 0;
    const positionPrevious =
      previous && previous.impressions > 0
        ? previous.weightedPosition / previous.impressions
        : 0;

    movements.push({
      url,
      pageId: current?.pageId ?? previous?.pageId ?? null,
      clicksCurrent,
      clicksPrevious,
      clicksDelta: clicksCurrent - clicksPrevious,
      impressionsCurrent,
      impressionsPrevious,
      impressionsDelta: impressionsCurrent - impressionsPrevious,
      positionCurrent,
      positionPrevious,
      positionDelta: positionCurrent - positionPrevious,
    });
  }

  return movements;
}

async function aggregateGscSummary(
  websiteId: string,
  organizationId: string,
  dateStart: Date,
  dateEnd: Date,
): Promise<GscPeriodSummary | null> {
  const snapshots = await prisma.gscPageSnapshot.findMany({
    where: {
      websiteId,
      dateStart,
      dateEnd,
      website: organizationWebsiteFilter(organizationId),
    },
    select: {
      clicks: true,
      impressions: true,
      ctr: true,
      avgPosition: true,
      dateStart: true,
      dateEnd: true,
    },
  });

  if (snapshots.length === 0) {
    return null;
  }

  const clicks = snapshots.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = snapshots.reduce((sum, row) => sum + row.impressions, 0);
  const weightedPosition = snapshots.reduce(
    (sum, row) => sum + row.avgPosition * row.impressions,
    0,
  );

  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    avgPosition: impressions > 0 ? weightedPosition / impressions : 0,
    dateStart,
    dateEnd,
  };
}

async function aggregateGa4Summary(
  websiteId: string,
  organizationId: string,
  dateStart: Date,
  dateEnd: Date,
): Promise<Ga4PeriodSummary | null> {
  const snapshots = await prisma.ga4LandingPageSnapshot.findMany({
    where: {
      websiteId,
      dateStart,
      dateEnd,
      website: organizationWebsiteFilter(organizationId),
    },
    select: {
      sessions: true,
      users: true,
      engagedSessions: true,
      engagementRate: true,
      averageEngagementTime: true,
      conversions: true,
      dateStart: true,
      dateEnd: true,
    },
  });

  if (snapshots.length === 0) {
    return null;
  }

  const sessions = snapshots.reduce((sum, row) => sum + row.sessions, 0);
  const users = snapshots.reduce((sum, row) => sum + row.users, 0);
  const engagedSessions = snapshots.reduce(
    (sum, row) => sum + row.engagedSessions,
    0,
  );
  const conversions = snapshots.reduce((sum, row) => sum + row.conversions, 0);
  const weightedEngagementRate = snapshots.reduce(
    (sum, row) => sum + row.engagementRate * row.sessions,
    0,
  );
  const weightedEngagementTime = snapshots.reduce(
    (sum, row) => sum + row.averageEngagementTime * row.sessions,
    0,
  );

  return {
    sessions,
    users,
    engagedSessions,
    engagementRate: sessions > 0 ? weightedEngagementRate / sessions : 0,
    averageEngagementTime:
      sessions > 0 ? weightedEngagementTime / sessions : 0,
    conversions,
    dateStart,
    dateEnd,
  };
}

async function getLatestSnapshotRanges(websiteId: string, organizationId: string) {
  const [gscRanges, ga4Ranges] = await Promise.all([
    prisma.gscPageSnapshot.findMany({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organizationId),
      },
      select: { dateStart: true, dateEnd: true },
      distinct: ["dateStart", "dateEnd"],
      orderBy: { dateEnd: "desc" },
      take: 2,
    }),
    prisma.ga4LandingPageSnapshot.findMany({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organizationId),
      },
      select: { dateStart: true, dateEnd: true },
      distinct: ["dateStart", "dateEnd"],
      orderBy: { dateEnd: "desc" },
      take: 2,
    }),
  ]);

  return { gscRanges, ga4Ranges };
}

function toTaskSnapshot(task: {
  id: string;
  title: string;
  status: string;
  priority: string;
  url: string | null;
  completedAt: Date | null;
}): ReportTaskSnapshot {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    url: task.url,
    completedAt: task.completedAt?.toISOString() ?? null,
  };
}

function toRecommendationSnapshot(rec: {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  impact: string;
  page: { url: string } | null;
}): ReportRecommendationSnapshot {
  return {
    id: rec.id,
    title: rec.title,
    status: rec.status,
    priority: rec.priority,
    type: rec.type,
    impact: rec.impact,
    pageUrl: rec.page?.url ?? null,
  };
}

export async function buildMonthlyReportData(
  websiteId: string,
  year: number,
  month: number,
): Promise<MonthlyReportStructuredData> {
  const organization = await requireOrganization();
  const period = getMonthPeriod(year, month);

  const { gscRanges } = await getLatestSnapshotRanges(
    websiteId,
    organization.id,
  );

  const [currentRange, previousRange] = gscRanges;
  let comparisonNote: string | null = null;
  let gscCurrent: GscPeriodSummary | null = null;
  let gscPrevious: GscPeriodSummary | null = null;
  let ga4Current: Ga4PeriodSummary | null = null;
  let ga4Previous: Ga4PeriodSummary | null = null;
  let topWinningPages: ReportPageMovement[] = [];
  let topDecliningPages: ReportPageMovement[] = [];

  if (currentRange) {
    [gscCurrent, gscPrevious, ga4Current, ga4Previous] = await Promise.all([
      aggregateGscSummary(
        websiteId,
        organization.id,
        currentRange.dateStart,
        currentRange.dateEnd,
      ),
      previousRange
        ? aggregateGscSummary(
            websiteId,
            organization.id,
            previousRange.dateStart,
            previousRange.dateEnd,
          )
        : Promise.resolve(null),
      aggregateGa4Summary(
        websiteId,
        organization.id,
        currentRange.dateStart,
        currentRange.dateEnd,
      ),
      previousRange
        ? aggregateGa4Summary(
            websiteId,
            organization.id,
            previousRange.dateStart,
            previousRange.dateEnd,
          )
        : Promise.resolve(null),
    ]);

    if (previousRange) {
      const [currentPages, previousPages] = await Promise.all([
        aggregateGscPages(
          websiteId,
          organization.id,
          currentRange.dateStart,
          currentRange.dateEnd,
        ),
        aggregateGscPages(
          websiteId,
          organization.id,
          previousRange.dateStart,
          previousRange.dateEnd,
        ),
      ]);

      const movements = buildPageMovements(currentPages, previousPages);
      topWinningPages = movements
        .filter((row) => row.clicksDelta > 0)
        .sort((a, b) => b.clicksDelta - a.clicksDelta)
        .slice(0, 10);
      topDecliningPages = movements
        .filter((row) => row.clicksDelta < 0)
        .sort((a, b) => a.clicksDelta - b.clicksDelta)
        .slice(0, 10);
    }

    comparisonNote = `Performance comparison uses GSC/GA4 snapshot ranges ${currentRange.dateStart.toISOString().slice(0, 10)} to ${currentRange.dateEnd.toISOString().slice(0, 10)}${
      previousRange
        ? ` vs ${previousRange.dateStart.toISOString().slice(0, 10)} to ${previousRange.dateEnd.toISOString().slice(0, 10)}`
        : ""
    }.`;
  } else {
    comparisonNote =
      "No GSC snapshot data available. Sync Google Search Console before generating reports.";
  }

  const [completedTasks, openTasks, openRecommendations, changeLogCount] =
    await Promise.all([
      prisma.task.findMany({
        where: {
          websiteId,
          status: "COMPLETED",
          completedAt: {
            gte: period.dateStart,
            lte: period.dateEnd,
          },
          website: organizationWebsiteFilter(organization.id),
        },
        orderBy: { completedAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          url: true,
          completedAt: true,
        },
      }),
      prisma.task.findMany({
        where: {
          websiteId,
          status: {
            in: [
              "TODO",
              "NEEDS_REVIEW",
              "APPROVED",
              "IN_PROGRESS",
              "BLOCKED",
            ],
          },
          website: organizationWebsiteFilter(organization.id),
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          url: true,
          completedAt: true,
        },
      }),
      prisma.recommendation.findMany({
        where: {
          websiteId,
          status: {
            in: ["DETECTED", "NEEDS_REVIEW", "APPROVED", "CONVERTED_TO_TASK"],
          },
          website: organizationWebsiteFilter(organization.id),
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        include: { page: true },
        take: 20,
      }),
      prisma.changeLog.count({
        where: {
          websiteId,
          changedAt: {
            gte: period.dateStart,
            lte: period.dateEnd,
          },
          website: organizationWebsiteFilter(organization.id),
        },
      }),
    ]);

  const itemsToMonitor = [
    ...topDecliningPages.slice(0, 5).map((page) => `Monitor declining page: ${page.url}`),
    ...openTasks
      .filter((task) => task.status === "BLOCKED")
      .map((task) => `Unblock task: ${task.title}`),
  ];

  return {
    period: {
      year,
      month,
      dateStart: period.dateStart.toISOString(),
      dateEnd: period.dateEnd.toISOString(),
      label: formatMonthLabel(year, month),
    },
    performance: {
      gsc: buildGscMetrics(gscCurrent, gscPrevious),
      ga4: buildGa4Metrics(ga4Current, ga4Previous),
      comparisonNote,
    },
    topWinningPages,
    topDecliningPages,
    completedTasks: completedTasks.map(toTaskSnapshot),
    openTasks: openTasks.map(toTaskSnapshot),
    openRecommendations: openRecommendations.map(toRecommendationSnapshot),
    itemsToMonitor,
    changeLogCount,
  };
}

export type { MonthPeriod };

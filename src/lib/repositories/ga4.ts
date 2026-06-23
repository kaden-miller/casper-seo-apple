import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export type Ga4PeriodSummary = {
  sessions: number;
  users: number;
  engagedSessions: number;
  engagementRate: number;
  averageEngagementTime: number;
  conversions: number;
  dateStart: Date;
  dateEnd: Date;
};

export type Ga4DashboardSummary = {
  current: Ga4PeriodSummary | null;
  previous: Ga4PeriodSummary | null;
  topLandingPages: Array<{
    path: string;
    url: string | null;
    sessions: number;
    users: number;
    conversions: number;
  }>;
};

export type Ga4PageMetrics = {
  current: {
    sessions: number;
    users: number;
    engagedSessions: number;
    engagementRate: number;
    averageEngagementTime: number;
    conversions: number;
    dateStart: Date;
    dateEnd: Date;
  } | null;
  previous: {
    sessions: number;
    users: number;
    engagedSessions: number;
    engagementRate: number;
    averageEngagementTime: number;
    conversions: number;
    dateStart: Date;
    dateEnd: Date;
  } | null;
};

function aggregateLandingPages(
  snapshots: Array<{
    sessions: number;
    users: number;
    engagedSessions: number;
    engagementRate: number;
    averageEngagementTime: number;
    conversions: number;
    dateStart: Date;
    dateEnd: Date;
  }>,
): Ga4PeriodSummary | null {
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
    dateStart: snapshots[0]!.dateStart,
    dateEnd: snapshots[0]!.dateEnd,
  };
}

async function summaryForRange(
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

  return aggregateLandingPages(snapshots);
}

export const ga4Repository = {
  async getDashboardSummary(websiteId: string): Promise<Ga4DashboardSummary> {
    const organization = await requireOrganization();

    const ranges = await prisma.ga4LandingPageSnapshot.findMany({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organization.id),
      },
      select: {
        dateStart: true,
        dateEnd: true,
      },
      distinct: ["dateStart", "dateEnd"],
      orderBy: { dateEnd: "desc" },
      take: 2,
    });

    if (ranges.length === 0) {
      return { current: null, previous: null, topLandingPages: [] };
    }

    const [latestRange, priorRange] = ranges;
    const [current, previous, topSnapshots] = await Promise.all([
      summaryForRange(
        websiteId,
        organization.id,
        latestRange!.dateStart,
        latestRange!.dateEnd,
      ),
      priorRange
        ? summaryForRange(
            websiteId,
            organization.id,
            priorRange.dateStart,
            priorRange.dateEnd,
          )
        : Promise.resolve(null),
      prisma.ga4LandingPageSnapshot.findMany({
        where: {
          websiteId,
          dateStart: latestRange!.dateStart,
          dateEnd: latestRange!.dateEnd,
          website: organizationWebsiteFilter(organization.id),
        },
        select: {
          path: true,
          url: true,
          sessions: true,
          users: true,
          conversions: true,
        },
        orderBy: { sessions: "desc" },
        take: 10,
      }),
    ]);

    return {
      current,
      previous,
      topLandingPages: topSnapshots.map((row) => ({
        path: row.path,
        url: row.url,
        sessions: row.sessions,
        users: row.users,
        conversions: row.conversions,
      })),
    };
  },

  async getPageMetrics(
    websiteId: string,
    pageId: string,
  ): Promise<Ga4PageMetrics> {
    const organization = await requireOrganization();

    const ranges = await prisma.ga4LandingPageSnapshot.findMany({
      where: {
        websiteId,
        pageId,
        website: organizationWebsiteFilter(organization.id),
      },
      select: {
        dateStart: true,
        dateEnd: true,
      },
      distinct: ["dateStart", "dateEnd"],
      orderBy: { dateEnd: "desc" },
      take: 2,
    });

    if (ranges.length === 0) {
      return { current: null, previous: null };
    }

    return ga4Repository.getPageMetricsForRanges(
      websiteId,
      organization.id,
      pageId,
      ranges,
    );
  },

  async getPageMetricsForRanges(
    websiteId: string,
    organizationId: string,
    pageId: string,
    ranges: Array<{ dateStart: Date; dateEnd: Date }>,
  ): Promise<Ga4PageMetrics> {
    const [latestRange, priorRange] = ranges;

    const [currentRow, previousRow] = await Promise.all([
      prisma.ga4LandingPageSnapshot.findFirst({
        where: {
          websiteId,
          pageId,
          dateStart: latestRange!.dateStart,
          dateEnd: latestRange!.dateEnd,
          website: organizationWebsiteFilter(organizationId),
        },
      }),
      priorRange
        ? prisma.ga4LandingPageSnapshot.findFirst({
            where: {
              websiteId,
              pageId,
              dateStart: priorRange.dateStart,
              dateEnd: priorRange.dateEnd,
              website: organizationWebsiteFilter(organizationId),
            },
          })
        : Promise.resolve(null),
    ]);

    return {
      current: currentRow
        ? {
            sessions: currentRow.sessions,
            users: currentRow.users,
            engagedSessions: currentRow.engagedSessions,
            engagementRate: currentRow.engagementRate,
            averageEngagementTime: currentRow.averageEngagementTime,
            conversions: currentRow.conversions,
            dateStart: currentRow.dateStart,
            dateEnd: currentRow.dateEnd,
          }
        : null,
      previous: previousRow
        ? {
            sessions: previousRow.sessions,
            users: previousRow.users,
            engagedSessions: previousRow.engagedSessions,
            engagementRate: previousRow.engagementRate,
            averageEngagementTime: previousRow.averageEngagementTime,
            conversions: previousRow.conversions,
            dateStart: previousRow.dateStart,
            dateEnd: previousRow.dateEnd,
          }
        : null,
    };
  },

  async getPageMetricsByPath(
    websiteId: string,
    path: string,
  ): Promise<Ga4PageMetrics> {
    const organization = await requireOrganization();
    const normalizedPath =
      path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

    const ranges = await prisma.ga4LandingPageSnapshot.findMany({
      where: {
        websiteId,
        path: { in: [normalizedPath, `${normalizedPath}/`] },
        website: organizationWebsiteFilter(organization.id),
      },
      select: { dateStart: true, dateEnd: true },
      distinct: ["dateStart", "dateEnd"],
      orderBy: { dateEnd: "desc" },
      take: 2,
    });

    if (ranges.length === 0) {
      return { current: null, previous: null };
    }

    const [latestRange, priorRange] = ranges;

    const [currentRow, previousRow] = await Promise.all([
      prisma.ga4LandingPageSnapshot.findFirst({
        where: {
          websiteId,
          path: { in: [normalizedPath, `${normalizedPath}/`] },
          dateStart: latestRange!.dateStart,
          dateEnd: latestRange!.dateEnd,
        },
      }),
      priorRange
        ? prisma.ga4LandingPageSnapshot.findFirst({
            where: {
              websiteId,
              path: { in: [normalizedPath, `${normalizedPath}/`] },
              dateStart: priorRange.dateStart,
              dateEnd: priorRange.dateEnd,
            },
          })
        : Promise.resolve(null),
    ]);

    return {
      current: currentRow
        ? {
            sessions: currentRow.sessions,
            users: currentRow.users,
            engagedSessions: currentRow.engagedSessions,
            engagementRate: currentRow.engagementRate,
            averageEngagementTime: currentRow.averageEngagementTime,
            conversions: currentRow.conversions,
            dateStart: currentRow.dateStart,
            dateEnd: currentRow.dateEnd,
          }
        : null,
      previous: previousRow
        ? {
            sessions: previousRow.sessions,
            users: previousRow.users,
            engagedSessions: previousRow.engagedSessions,
            engagementRate: previousRow.engagementRate,
            averageEngagementTime: previousRow.averageEngagementTime,
            conversions: previousRow.conversions,
            dateStart: previousRow.dateStart,
            dateEnd: previousRow.dateEnd,
          }
        : null,
    };
  },
};

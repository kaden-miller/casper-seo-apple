import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export type GscPeriodSummary = {
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  dateStart: Date;
  dateEnd: Date;
};

export type GscDashboardSummary = {
  current: GscPeriodSummary | null;
  previous: GscPeriodSummary | null;
};

function aggregatePageSnapshots(
  snapshots: Array<{
    clicks: number;
    impressions: number;
    ctr: number;
    avgPosition: number;
    dateStart: Date;
    dateEnd: Date;
  }>,
): GscPeriodSummary | null {
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
    dateStart: snapshots[0]!.dateStart,
    dateEnd: snapshots[0]!.dateEnd,
  };
}

async function summaryForRange(
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

  return aggregatePageSnapshots(snapshots);
}

export const gscRepository = {
  async getDashboardSummary(websiteId: string): Promise<GscDashboardSummary> {
    const organization = await requireOrganization();

    const ranges = await prisma.gscPageSnapshot.findMany({
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
      return { current: null, previous: null };
    }

    const [latestRange, priorRange] = ranges;
    const [current, previous] = await Promise.all([
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
    ]);

    return { current, previous };
  },

  async getLatestSyncAt(websiteId: string): Promise<Date | null> {
    const organization = await requireOrganization();

    const integration = await prisma.integration.findFirst({
      where: {
        websiteId,
        type: "GSC",
        website: organizationWebsiteFilter(organization.id),
      },
      select: { lastSyncedAt: true },
    });

    return integration?.lastSyncedAt ?? null;
  },
};

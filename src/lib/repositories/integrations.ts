import type { IntegrationType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export const integrationRepository = {
  async listForWebsite(websiteId: string) {
    const organization = await requireOrganization();

    return prisma.integration.findMany({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organization.id),
      },
      include: {
        runs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  },

  async getByType(websiteId: string, type: IntegrationType) {
    const organization = await requireOrganization();

    return prisma.integration.findFirst({
      where: {
        websiteId,
        type,
        website: organizationWebsiteFilter(organization.id),
      },
    });
  },

  async listRecentRuns(websiteId: string, limit = 10) {
    const organization = await requireOrganization();

    return prisma.integrationRun.findMany({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};

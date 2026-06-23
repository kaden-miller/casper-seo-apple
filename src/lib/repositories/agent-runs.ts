import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export const agentRunRepository = {
  async listForWebsite(websiteId: string, limit = 20) {
    const organization = await requireOrganization();

    return prisma.agentRun.findMany({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async getById(agentRunId: string) {
    const organization = await requireOrganization();

    return prisma.agentRun.findFirst({
      where: {
        id: agentRunId,
        website: organizationWebsiteFilter(organization.id),
      },
    });
  },
};

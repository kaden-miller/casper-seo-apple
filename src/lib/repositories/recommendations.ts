import type { RecommendationStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export const recommendationRepository = {
  async listForWebsite(websiteId: string, status?: RecommendationStatus) {
    const organization = await requireOrganization();

    return prisma.recommendation.findMany({
      where: {
        websiteId,
        ...(status ? { status } : {}),
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: { page: true },
    });
  },

  async getById(recommendationId: string) {
    const organization = await requireOrganization();

    return prisma.recommendation.findFirst({
      where: {
        id: recommendationId,
        website: organizationWebsiteFilter(organization.id),
      },
      include: {
        page: true,
        website: { include: { client: true } },
        tasks: true,
      },
    });
  },

  async countOpenForOrganization() {
    const organization = await requireOrganization();

    return prisma.recommendation.count({
      where: {
        website: organizationWebsiteFilter(organization.id),
        status: { in: ["DETECTED", "NEEDS_REVIEW", "APPROVED"] },
      },
    });
  },
};

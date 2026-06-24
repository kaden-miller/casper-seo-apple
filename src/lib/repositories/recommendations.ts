import type {
  PriorityLevel,
  RecommendationStatus,
  RecommendationType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export type RecommendationListFilters = {
  websiteId?: string;
  status?: RecommendationStatus;
  priority?: PriorityLevel;
  type?: RecommendationType;
};

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

  async listForOrganization(filters: RecommendationListFilters = {}) {
    const organization = await requireOrganization();

    return prisma.recommendation.findMany({
      where: {
        website: organizationWebsiteFilter(organization.id),
        ...(filters.websiteId ? { websiteId: filters.websiteId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.type ? { type: filters.type } : {}),
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        page: true,
        website: { include: { client: true } },
      },
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
        tasks: { orderBy: { createdAt: "desc" } },
        changeLogs: { orderBy: { changedAt: "desc" } },
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

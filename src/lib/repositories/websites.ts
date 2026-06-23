import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export const websiteRepository = {
  async list() {
    const organization = await requireOrganization();

    return prisma.website.findMany({
      where: organizationWebsiteFilter(organization.id),
      orderBy: { name: "asc" },
      include: {
        client: true,
        _count: {
          select: {
            keywords: true,
            competitors: true,
            pages: true,
            integrations: true,
          },
        },
      },
    });
  },

  async getById(websiteId: string) {
    const organization = await requireOrganization();

    return prisma.website.findFirst({
      where: {
        id: websiteId,
        ...organizationWebsiteFilter(organization.id),
      },
      include: {
        client: true,
        keywords: { orderBy: { createdAt: "desc" } },
        competitors: { orderBy: { createdAt: "desc" } },
        integrations: true,
        crawlRuns: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            pages: true,
            recommendations: true,
            tasks: true,
            agentRuns: true,
          },
        },
      },
    });
  },

  async create(data: {
    clientId: string;
    name: string;
    url: string;
    cmsType?: string;
    primaryLocation?: string;
    serviceAreas?: string[];
    targetServices?: string[];
    notes?: string;
  }) {
    const organization = await requireOrganization();

    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        organizationId: organization.id,
      },
    });

    if (!client) {
      return null;
    }

    const { clientId, serviceAreas, targetServices, ...rest } = data;

    return prisma.website.create({
      data: {
        ...rest,
        clientId,
        serviceAreas: serviceAreas ?? [],
        targetServices: targetServices ?? [],
      },
    });
  },

  async count() {
    const organization = await requireOrganization();

    return prisma.website.count({
      where: organizationWebsiteFilter(organization.id),
    });
  },
};

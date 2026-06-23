import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export const pageRepository = {
  async listForWebsite(websiteId: string) {
    const organization = await requireOrganization();

    return prisma.page.findMany({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: { url: "asc" },
      include: {
        _count: { select: { snapshots: true, recommendations: true } },
      },
    });
  },

  async getById(pageId: string) {
    const organization = await requireOrganization();

    return prisma.page.findFirst({
      where: {
        id: pageId,
        website: organizationWebsiteFilter(organization.id),
      },
      include: {
        snapshots: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        website: { include: { client: true } },
      },
    });
  },

  async listCrawlRuns(websiteId: string) {
    const organization = await requireOrganization();

    return prisma.crawlRun.findMany({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async listWithLatestSnapshot(websiteId: string) {
    const organization = await requireOrganization();

    const pages = await prisma.page.findMany({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: { url: "asc" },
      include: {
        snapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return pages;
  },

  async listAllForOrganization() {
    const organization = await requireOrganization();

    return prisma.page.findMany({
      where: {
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: [{ website: { name: "asc" } }, { url: "asc" }],
      include: {
        website: { include: { client: true } },
        snapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  },
};

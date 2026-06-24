import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export const monthlyReportRepository = {
  async listForOrganization(websiteId?: string) {
    const organization = await requireOrganization();

    return prisma.monthlyReport.findMany({
      where: {
        website: organizationWebsiteFilter(organization.id),
        ...(websiteId ? { websiteId } : {}),
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { generatedAt: "desc" }],
      include: {
        website: { include: { client: true } },
      },
    });
  },

  async listForWebsite(websiteId: string) {
    const organization = await requireOrganization();

    return prisma.monthlyReport.findMany({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  },

  async getById(reportId: string) {
    const organization = await requireOrganization();

    return prisma.monthlyReport.findFirst({
      where: {
        id: reportId,
        website: organizationWebsiteFilter(organization.id),
      },
      include: {
        website: { include: { client: true } },
      },
    });
  },

  async getLatestForWebsite(websiteId: string) {
    const organization = await requireOrganization();

    return prisma.monthlyReport.findFirst({
      where: {
        websiteId,
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  },
};

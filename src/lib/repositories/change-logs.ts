import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export const changeLogRepository = {
  async listForOrganization(websiteId?: string) {
    const organization = await requireOrganization();

    return prisma.changeLog.findMany({
      where: {
        website: organizationWebsiteFilter(organization.id),
        ...(websiteId ? { websiteId } : {}),
      },
      orderBy: { changedAt: "desc" },
      include: {
        website: { include: { client: true } },
        task: true,
        recommendation: true,
        changedBy: true,
      },
      take: 100,
    });
  },

  async listForTask(taskId: string) {
    const organization = await requireOrganization();

    return prisma.changeLog.findMany({
      where: {
        taskId,
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: { changedAt: "desc" },
      include: { changedBy: true },
    });
  },
};

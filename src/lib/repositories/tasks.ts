import type { TaskStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  organizationWebsiteFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export type TaskListFilters = {
  websiteId?: string;
  status?: TaskStatus;
};

export const taskRepository = {
  async listForWebsite(websiteId: string, status?: TaskStatus) {
    const organization = await requireOrganization();

    return prisma.task.findMany({
      where: {
        websiteId,
        ...(status ? { status } : {}),
        website: organizationWebsiteFilter(organization.id),
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        recommendation: true,
        page: true,
        assignee: true,
      },
    });
  },

  async listForOrganization(filters: TaskListFilters = {}) {
    const organization = await requireOrganization();

    return prisma.task.findMany({
      where: {
        website: organizationWebsiteFilter(organization.id),
        ...(filters.websiteId ? { websiteId: filters.websiteId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        recommendation: true,
        page: true,
        assignee: true,
        website: { include: { client: true } },
      },
    });
  },

  async getById(taskId: string) {
    const organization = await requireOrganization();

    return prisma.task.findFirst({
      where: {
        id: taskId,
        website: organizationWebsiteFilter(organization.id),
      },
      include: {
        recommendation: true,
        page: true,
        assignee: true,
        changeLogs: { orderBy: { changedAt: "desc" } },
        website: { include: { client: true } },
      },
    });
  },

  async countOpenForOrganization() {
    const organization = await requireOrganization();

    return prisma.task.count({
      where: {
        website: organizationWebsiteFilter(organization.id),
        status: {
          in: ["TODO", "NEEDS_REVIEW", "APPROVED", "IN_PROGRESS", "BLOCKED"],
        },
      },
    });
  },
};

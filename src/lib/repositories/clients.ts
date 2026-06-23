import { prisma } from "@/lib/db";
import {
  organizationClientFilter,
  requireOrganization,
} from "@/lib/repositories/base";

export const clientRepository = {
  async list() {
    const organization = await requireOrganization();

    return prisma.client.findMany({
      where: organizationClientFilter(organization.id),
      orderBy: { name: "asc" },
      include: {
        _count: { select: { websites: true, recommendations: true, tasks: true } },
      },
    });
  },

  async getById(clientId: string) {
    const organization = await requireOrganization();

    return prisma.client.findFirst({
      where: {
        id: clientId,
        ...organizationClientFilter(organization.id),
      },
      include: {
        websites: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { keywords: true, competitors: true, pages: true },
            },
          },
        },
        _count: {
          select: { recommendations: true, tasks: true, monthlyReports: true },
        },
      },
    });
  },

  async create(data: {
    name: string;
    businessDescription?: string;
    industry?: string;
    notes?: string;
  }) {
    const organization = await requireOrganization();

    return prisma.client.create({
      data: {
        ...data,
        organizationId: organization.id,
      },
    });
  },

  async update(
    clientId: string,
    data: {
      name: string;
      businessDescription?: string;
      industry?: string;
      notes?: string;
    },
  ) {
    const organization = await requireOrganization();

    return prisma.client.updateMany({
      where: {
        id: clientId,
        ...organizationClientFilter(organization.id),
      },
      data,
    });
  },

  async delete(clientId: string) {
    const organization = await requireOrganization();

    return prisma.client.deleteMany({
      where: {
        id: clientId,
        ...organizationClientFilter(organization.id),
      },
    });
  },

  async count() {
    const organization = await requireOrganization();

    return prisma.client.count({
      where: organizationClientFilter(organization.id),
    });
  },
};

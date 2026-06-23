import type { Organization } from "@/generated/prisma/client";
import { getUserOrganization } from "@/lib/auth/session";

export async function requireOrganization(): Promise<Organization> {
  return getUserOrganization();
}

export function organizationClientFilter(organizationId: string) {
  return { organizationId };
}

export function organizationWebsiteFilter(organizationId: string) {
  return { client: { organizationId } };
}

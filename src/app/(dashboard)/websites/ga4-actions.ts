"use server";

import { revalidatePath } from "next/cache";
import { getWebsiteForUser } from "@/lib/data/seo";
import { prisma } from "@/lib/db";
import {
  formatGa4ApiError,
  listGa4Properties,
  normalizeGa4PropertyId,
} from "@/lib/integrations/ga4/client";
import { importGa4DataForWebsite } from "@/lib/integrations/ga4/import";
import {
  encryptedTokensFromCredentials,
  getAuthenticatedGoogleClient,
} from "@/lib/integrations/google/oauth";
import { integrationRepository } from "@/lib/repositories";

type ActionResult = {
  error?: string;
  success?: boolean;
  properties?: Array<{ propertyId: string; displayName: string; account: string }>;
  recordsImported?: number;
};

function revalidateWebsite(websiteId: string) {
  revalidatePath(`/websites/${websiteId}`);
  revalidatePath("/websites");
  revalidatePath("/dashboard");
}

export async function listGa4PropertiesForWebsite(
  websiteId: string,
): Promise<ActionResult> {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  const integration = await integrationRepository.getByType(websiteId, "GA4");
  if (!integration || integration.status === "DISCONNECTED") {
    return { error: "Google Analytics is not connected" };
  }

  try {
    const { client, refreshedCredentials } =
      await getAuthenticatedGoogleClient(integration);

    if (refreshedCredentials) {
      const encrypted = encryptedTokensFromCredentials(refreshedCredentials);
      await prisma.integration.update({
        where: { id: integration.id },
        data: encrypted,
      });
    }

    const properties = await listGa4Properties(client);
    return { success: true, properties };
  } catch (error) {
    return { error: formatGa4ApiError(error) };
  }
}

export async function saveGa4PropertyId(
  websiteId: string,
  propertyId: string,
): Promise<ActionResult> {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  const normalized = normalizeGa4PropertyId(propertyId);
  if (!normalized) {
    return { error: "Select a GA4 property" };
  }

  const integration = await integrationRepository.getByType(websiteId, "GA4");
  if (!integration) {
    return { error: "Connect Google Analytics before selecting a property" };
  }

  await prisma.integration.update({
    where: { id: integration.id },
    data: {
      propertyId: normalized,
      status: "CONNECTED",
    },
  });

  revalidateWebsite(websiteId);
  return { success: true };
}

export async function syncGa4Data(websiteId: string): Promise<ActionResult> {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  const integration = await integrationRepository.getByType(websiteId, "GA4");
  if (!integration || integration.status === "DISCONNECTED") {
    return { error: "Google Analytics is not connected" };
  }

  if (!integration.propertyId) {
    return { error: "Select a GA4 property before syncing" };
  }

  try {
    const result = await importGa4DataForWebsite(integration, website.url);
    revalidateWebsite(websiteId);
    revalidatePath(`/websites/${websiteId}/pages`, "layout");
    return {
      success: true,
      recordsImported: result.recordsImported,
    };
  } catch (error) {
    revalidateWebsite(websiteId);
    return {
      error: error instanceof Error ? error.message : "GA4 sync failed",
    };
  }
}

export async function disconnectGa4(websiteId: string): Promise<ActionResult> {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  await prisma.integration.upsert({
    where: {
      websiteId_type: {
        websiteId,
        type: "GA4",
      },
    },
    create: {
      websiteId,
      type: "GA4",
      status: "DISCONNECTED",
    },
    update: {
      status: "DISCONNECTED",
      propertyId: null,
      accessTokenEncrypted: null,
      refreshTokenEncrypted: null,
      expiresAt: null,
      lastSyncedAt: null,
    },
  });

  revalidateWebsite(websiteId);
  return { success: true };
}

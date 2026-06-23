"use server";

import { revalidatePath } from "next/cache";
import { getWebsiteForUser } from "@/lib/data/seo";
import { prisma } from "@/lib/db";
import {
  getAuthenticatedGoogleClient,
  encryptedTokensFromCredentials,
} from "@/lib/integrations/google/oauth";
import { listGscSites, formatGscApiError } from "@/lib/integrations/gsc/client";
import { importGscDataForWebsite } from "@/lib/integrations/gsc/import";
import { integrationRepository } from "@/lib/repositories";

type ActionResult = {
  error?: string;
  success?: boolean;
  sites?: string[];
  recordsImported?: number;
};

function revalidateWebsite(websiteId: string) {
  revalidatePath(`/websites/${websiteId}`);
  revalidatePath("/websites");
  revalidatePath("/dashboard");
}

export async function listGscSitesForWebsite(
  websiteId: string,
): Promise<ActionResult> {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  const integration = await integrationRepository.getByType(websiteId, "GSC");
  if (!integration || integration.status === "DISCONNECTED") {
    return { error: "Search Console is not connected" };
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

    const sites = await listGscSites(client);
    return {
      success: true,
      sites: sites.map((site) => site.siteUrl),
    };
  } catch (error) {
    return { error: formatGscApiError(error) };
  }
}

export async function saveGscSiteUrl(
  websiteId: string,
  siteUrl: string,
): Promise<ActionResult> {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  const trimmed = siteUrl.trim();
  if (!trimmed) {
    return { error: "Select a Search Console property" };
  }

  const integration = await integrationRepository.getByType(websiteId, "GSC");
  if (!integration) {
    return { error: "Connect Search Console before selecting a property" };
  }

  await prisma.integration.update({
    where: { id: integration.id },
    data: {
      siteUrl: trimmed,
      status: "CONNECTED",
    },
  });

  revalidateWebsite(websiteId);
  return { success: true };
}

export async function syncGscData(websiteId: string): Promise<ActionResult> {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  const integration = await integrationRepository.getByType(websiteId, "GSC");
  if (!integration || integration.status === "DISCONNECTED") {
    return { error: "Search Console is not connected" };
  }

  if (!integration.siteUrl) {
    return { error: "Select a Search Console property before syncing" };
  }

  try {
    const result = await importGscDataForWebsite(integration);
    revalidateWebsite(websiteId);
    return {
      success: true,
      recordsImported: result.recordsImported,
    };
  } catch (error) {
    revalidateWebsite(websiteId);
    return {
      error: error instanceof Error ? error.message : "GSC sync failed",
    };
  }
}

export async function disconnectGsc(websiteId: string): Promise<ActionResult> {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  await prisma.integration.upsert({
    where: {
      websiteId_type: {
        websiteId,
        type: "GSC",
      },
    },
    create: {
      websiteId,
      type: "GSC",
      status: "DISCONNECTED",
    },
    update: {
      status: "DISCONNECTED",
      siteUrl: null,
      accessTokenEncrypted: null,
      refreshTokenEncrypted: null,
      expiresAt: null,
      lastSyncedAt: null,
    },
  });

  revalidateWebsite(websiteId);
  return { success: true };
}

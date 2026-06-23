"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runCrawlForWebsite } from "@/lib/crawler/persist-crawl";
import { getClientForUser, getWebsiteForUser } from "@/lib/data/seo";
import { prisma } from "@/lib/db";
import {
  competitorSchema,
  keywordSchema,
  websiteSchema,
} from "@/lib/validations/seo";
import { normalizeUrl, parseCommaList } from "@/lib/utils/form";

type ActionState = { error?: string } | undefined;

export async function createWebsite(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = websiteSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    url: normalizeUrl(String(formData.get("url") ?? "")),
    cmsType: formData.get("cmsType") || undefined,
    primaryLocation: formData.get("primaryLocation") || undefined,
    serviceAreas: formData.get("serviceAreas") || undefined,
    targetServices: formData.get("targetServices") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const client = await getClientForUser(parsed.data.clientId);
  if (!client) {
    return { error: "Client not found" };
  }

  const { serviceAreas, targetServices, ...rest } = parsed.data;

  const website = await prisma.website.create({
    data: {
      ...rest,
      serviceAreas: parseCommaList(serviceAreas),
      targetServices: parseCommaList(targetServices),
    },
  });

  revalidatePath("/websites");
  revalidatePath(`/clients/${parsed.data.clientId}`);
  redirect(`/websites/${website.id}`);
}

export async function updateWebsite(
  websiteId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const existing = await getWebsiteForUser(websiteId);
  if (!existing) {
    return { error: "Website not found" };
  }

  const parsed = websiteSchema.safeParse({
    clientId: existing.clientId,
    name: formData.get("name"),
    url: normalizeUrl(String(formData.get("url") ?? "")),
    cmsType: formData.get("cmsType") || undefined,
    primaryLocation: formData.get("primaryLocation") || undefined,
    serviceAreas: formData.get("serviceAreas") || undefined,
    targetServices: formData.get("targetServices") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const { serviceAreas, targetServices, clientId, ...rest } = parsed.data;
  void clientId;

  await prisma.website.update({
    where: { id: websiteId },
    data: {
      ...rest,
      serviceAreas: parseCommaList(serviceAreas),
      targetServices: parseCommaList(targetServices),
    },
  });

  revalidatePath("/websites");
  revalidatePath(`/websites/${websiteId}`);
  revalidatePath(`/clients/${existing.clientId}`);
  redirect(`/websites/${websiteId}`);
}

export async function createKeyword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = keywordSchema.safeParse({
    websiteId: formData.get("websiteId"),
    keyword: formData.get("keyword"),
    targetUrl: formData.get("targetUrl") || undefined,
    location: formData.get("location") || undefined,
    device: formData.get("device"),
    priority: formData.get("priority"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const website = await getWebsiteForUser(parsed.data.websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  await prisma.keyword.create({ data: parsed.data });

  revalidatePath(`/websites/${parsed.data.websiteId}`);
  revalidatePath(`/clients/${website.clientId}`);
  return undefined;
}

export async function deleteKeyword(keywordId: string, websiteId: string) {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return;
  }

  await prisma.keyword.deleteMany({
    where: { id: keywordId, websiteId },
  });

  revalidatePath(`/websites/${websiteId}`);
  revalidatePath(`/clients/${website.clientId}`);
}

export async function createCompetitor(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = competitorSchema.safeParse({
    websiteId: formData.get("websiteId"),
    name: formData.get("name"),
    domain: formData.get("domain"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const website = await getWebsiteForUser(parsed.data.websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  await prisma.competitor.create({ data: parsed.data });

  revalidatePath(`/websites/${parsed.data.websiteId}`);
  revalidatePath(`/clients/${website.clientId}`);
  return undefined;
}

export async function deleteCompetitor(
  competitorId: string,
  websiteId: string,
) {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return;
  }

  await prisma.competitor.deleteMany({
    where: { id: competitorId, websiteId },
  });

  revalidatePath(`/websites/${websiteId}`);
  revalidatePath(`/clients/${website.clientId}`);
}

export async function runWebsiteCrawl(websiteId: string) {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  try {
    const result = await runCrawlForWebsite(website.id, website.url);

    revalidatePath(`/websites/${websiteId}`);
    revalidatePath("/pages");

    return {
      success: true as const,
      ...result,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Crawl failed unexpectedly";

    revalidatePath(`/websites/${websiteId}`);

    return { error: message };
  }
}

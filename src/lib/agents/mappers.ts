import type {
  ImpactLevel,
  PriorityLevel,
  RecommendationType,
} from "@/generated/prisma/client";
import { normalizeUrl } from "@/lib/crawler/url-utils";
import { prisma } from "@/lib/db";

export function mapRecommendationType(value: string): RecommendationType {
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const allowed: RecommendationType[] = [
    "TITLE_TAG_OPPORTUNITY",
    "META_DESCRIPTION_OPPORTUNITY",
    "H1_OPPORTUNITY",
    "CONTENT_REFRESH",
    "NEW_CONTENT_OPPORTUNITY",
    "INTERNAL_LINK_OPPORTUNITY",
    "TECHNICAL_ISSUE",
    "INDEXING_ISSUE",
    "SCHEMA_OPPORTUNITY",
    "IMAGE_ALT_OPPORTUNITY",
    "KEYWORD_CANNIBALIZATION",
    "CTR_OPPORTUNITY",
    "RANKING_DROP",
    "COMPETITOR_GAP",
    "OTHER",
  ];

  if (allowed.includes(normalized as RecommendationType)) {
    return normalized as RecommendationType;
  }

  return "OTHER";
}

export function mapPriorityLevel(value: string): PriorityLevel {
  switch (value.toLowerCase()) {
    case "critical":
      return "URGENT";
    case "high":
      return "HIGH";
    case "medium":
      return "MEDIUM";
    default:
      return "LOW";
  }
}

export function mapImpactLevel(value: string): ImpactLevel {
  switch (value.toLowerCase()) {
    case "high":
      return "HIGH";
    case "medium":
      return "MEDIUM";
    default:
      return "LOW";
  }
}

export function confidenceLevelToScore(value: string): number {
  switch (value.toLowerCase()) {
    case "high":
      return 0.9;
    case "medium":
      return 0.7;
    default:
      return 0.5;
  }
}

export async function resolvePageId(
  websiteId: string,
  pageUrl?: string,
): Promise<string | null> {
  if (!pageUrl) {
    return null;
  }

  const normalized = normalizeUrl(pageUrl);
  if (!normalized) {
    return null;
  }

  const page = await prisma.page.findFirst({
    where: {
      websiteId,
      OR: [{ normalizedUrl: normalized }, { url: pageUrl }],
    },
    select: { id: true },
  });

  return page?.id ?? null;
}

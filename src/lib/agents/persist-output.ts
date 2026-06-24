import type { Prisma, RecommendationStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  confidenceLevelToScore,
  mapImpactLevel,
  mapPriorityLevel,
  mapRecommendationType,
  resolvePageId,
} from "@/lib/agents/mappers";
import type { agentRecommendationSchema } from "@/lib/agents/schemas";
import {
  prioritizationOutputSchema,
  qaOutputSchema,
  recommendationListOutputSchema,
} from "@/lib/agents/schemas";
import type { AgentName } from "@/lib/agents/types";
import type { z } from "zod";

type AgentRecommendation = z.infer<typeof agentRecommendationSchema>;

export type PersistAgentOutputResult = {
  recommendationsCreated: number;
  recommendationsUpdated: number;
};

const RECOMMENDATION_AGENTS: AgentName[] = [
  "technicalSeoAgent",
  "searchPerformanceAgent",
  "onPageSeoAgent",
];

function sourceAgentsPayload(agentName: AgentName, agentRunId: string) {
  return [{ agentName, agentRunId, createdAt: new Date().toISOString() }];
}

async function createRecommendationFromAgentItem(
  websiteId: string,
  clientId: string,
  agentName: AgentName,
  agentRunId: string,
  item: AgentRecommendation,
): Promise<boolean> {
  const pageId = await resolvePageId(websiteId, item.pageUrl);
  const type = mapRecommendationType(item.recommendationType);

  const existing = await prisma.recommendation.findFirst({
    where: {
      websiteId,
      title: item.title,
      type,
      status: { in: ["DETECTED", "NEEDS_REVIEW"] },
      ...(pageId ? { pageId } : {}),
    },
  });

  if (existing) {
    return false;
  }

  await prisma.recommendation.create({
    data: {
      websiteId,
      clientId,
      pageId,
      type,
      title: item.title,
      description: item.description,
      reason: item.suggestedAction,
      currentValue: null,
      suggestedValue: null,
      supportingData: JSON.parse(
        JSON.stringify({
          items: item.supportingData,
          suggestedAction: item.suggestedAction,
          targetKeyword: item.targetKeyword ?? null,
          agentRunId,
        }),
      ) as Prisma.InputJsonValue,
      sourceAgents: JSON.parse(
        JSON.stringify(sourceAgentsPayload(agentName, agentRunId)),
      ) as Prisma.InputJsonValue,
      priority: mapPriorityLevel(item.priority),
      impact: mapImpactLevel(item.impact),
      effort: mapImpactLevel(item.effort),
      risk: mapImpactLevel(item.risk),
      confidenceScore: confidenceLevelToScore(item.confidence),
      status: "DETECTED",
    },
  });

  return true;
}

async function persistRecommendationList(
  websiteId: string,
  clientId: string,
  agentName: AgentName,
  agentRunId: string,
  parsedOutput: unknown,
): Promise<PersistAgentOutputResult> {
  const parsed = recommendationListOutputSchema.parse(parsedOutput);
  let recommendationsCreated = 0;

  for (const item of parsed.recommendations) {
    const created = await createRecommendationFromAgentItem(
      websiteId,
      clientId,
      agentName,
      agentRunId,
      item,
    );
    if (created) {
      recommendationsCreated += 1;
    }
  }

  return { recommendationsCreated, recommendationsUpdated: 0 };
}

async function persistPrioritizationOutput(
  websiteId: string,
  parsedOutput: unknown,
  agentRunId: string,
): Promise<PersistAgentOutputResult> {
  const parsed = prioritizationOutputSchema.parse(parsedOutput);
  let recommendationsUpdated = 0;

  for (const item of parsed.prioritizedRecommendations) {
    const recommendation = item.recommendationId
      ? await prisma.recommendation.findFirst({
          where: { id: item.recommendationId, websiteId },
        })
      : await prisma.recommendation.findFirst({
          where: {
            websiteId,
            title: item.title,
            status: { in: ["DETECTED", "NEEDS_REVIEW", "APPROVED"] },
          },
        });

    if (!recommendation) {
      continue;
    }

    const existingSupporting =
      recommendation.supportingData &&
      typeof recommendation.supportingData === "object" &&
      !Array.isArray(recommendation.supportingData)
        ? (recommendation.supportingData as Record<string, unknown>)
        : {};

    await prisma.recommendation.update({
      where: { id: recommendation.id },
      data: {
        priority: mapPriorityLevel(item.priority),
        impact: mapImpactLevel(item.impact),
        effort: mapImpactLevel(item.effort),
        risk: mapImpactLevel(item.risk),
        confidenceScore: confidenceLevelToScore(item.confidence),
        supportingData: {
          ...existingSupporting,
          prioritization: {
            score: item.score,
            rank: item.rank,
            agentRunId,
          },
        },
      },
    });

    recommendationsUpdated += 1;
  }

  return { recommendationsCreated: 0, recommendationsUpdated };
}

async function persistQaOutput(
  websiteId: string,
  parsedOutput: unknown,
): Promise<PersistAgentOutputResult> {
  const parsed = qaOutputSchema.parse(parsedOutput);
  let recommendationsUpdated = 0;

  const statusMap: Record<
    "approved" | "rejected" | "needs_edits",
    RecommendationStatus
  > = {
    approved: "APPROVED",
    rejected: "REJECTED",
    needs_edits: "NEEDS_REVIEW",
  };

  for (const review of parsed.reviews) {
    const recommendation = await prisma.recommendation.findFirst({
      where: { id: review.recommendationId, websiteId },
    });

    if (!recommendation) {
      continue;
    }

    const existingSupporting =
      recommendation.supportingData &&
      typeof recommendation.supportingData === "object" &&
      !Array.isArray(recommendation.supportingData)
        ? (recommendation.supportingData as Record<string, unknown>)
        : {};

    await prisma.recommendation.update({
      where: { id: recommendation.id },
      data: {
        status: statusMap[review.decision],
        reason: review.reason,
        supportingData: {
          ...existingSupporting,
          qaReview: {
            decision: review.decision,
            reason: review.reason,
            suggestedEdits: review.suggestedEdits ?? null,
            reviewedAt: new Date().toISOString(),
          },
        },
      },
    });

    recommendationsUpdated += 1;
  }

  return { recommendationsCreated: 0, recommendationsUpdated };
}

export async function persistAgentOutput(
  agentName: AgentName,
  websiteId: string,
  clientId: string,
  agentRunId: string,
  parsedOutput: unknown,
): Promise<PersistAgentOutputResult> {
  if (RECOMMENDATION_AGENTS.includes(agentName)) {
    return persistRecommendationList(
      websiteId,
      clientId,
      agentName,
      agentRunId,
      parsedOutput,
    );
  }

  if (agentName === "prioritizationAgent") {
    return persistPrioritizationOutput(websiteId, parsedOutput, agentRunId);
  }

  if (agentName === "qaAgent") {
    return persistQaOutput(websiteId, parsedOutput);
  }

  return { recommendationsCreated: 0, recommendationsUpdated: 0 };
}

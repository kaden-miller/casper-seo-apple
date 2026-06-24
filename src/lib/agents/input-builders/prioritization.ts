import { recommendationRepository } from "@/lib/repositories/recommendations";

export async function buildPrioritizationInput(websiteId: string) {
  const recommendations = await recommendationRepository.listForWebsite(
    websiteId,
  );

  const candidates = recommendations
    .filter((rec) => ["DETECTED", "NEEDS_REVIEW", "APPROVED"].includes(rec.status))
    .map((rec) => ({
      recommendationId: rec.id,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      reason: rec.reason,
      pageUrl: rec.page?.url ?? null,
      priority: rec.priority,
      impact: rec.impact,
      effort: rec.effort,
      risk: rec.risk,
      confidenceScore: rec.confidenceScore,
      supportingData: rec.supportingData,
      status: rec.status,
    }));

  return {
    recommendations: candidates,
    instruction:
      "Score and rank the provided recommendations. Echo recommendationId for each item in prioritizedRecommendations.",
  };
}

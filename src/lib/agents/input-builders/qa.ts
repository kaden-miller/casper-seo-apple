import { recommendationRepository } from "@/lib/repositories/recommendations";

export async function buildQaInput(websiteId: string) {
  const recommendations = await recommendationRepository.listForWebsite(
    websiteId,
  );

  const candidates = recommendations
    .filter((rec) =>
      ["DETECTED", "NEEDS_REVIEW", "APPROVED"].includes(rec.status),
    )
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
      suggestedAction:
        typeof rec.supportingData === "object" &&
        rec.supportingData &&
        "suggestedAction" in rec.supportingData
          ? String(
              (rec.supportingData as { suggestedAction?: unknown })
                .suggestedAction ?? "",
            )
          : null,
      status: rec.status,
    }));

  return {
    recommendations: candidates,
    instruction:
      "Review each recommendation for evidence quality and actionability. Use the exact recommendationId in each review.",
  };
}

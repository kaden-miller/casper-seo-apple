import { z } from "zod";

const levelSchema = z.enum(["low", "medium", "high"]);
const prioritySchema = z.enum(["low", "medium", "high", "critical"]);

export const supportingDataItemSchema = z.record(z.string(), z.unknown());

export const agentRecommendationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  recommendationType: z.string().min(1),
  priority: prioritySchema,
  impact: levelSchema,
  confidence: levelSchema,
  effort: levelSchema,
  risk: levelSchema,
  pageUrl: z.string().optional(),
  targetKeyword: z.string().optional(),
  supportingData: z.array(supportingDataItemSchema).default([]),
  suggestedAction: z.string().min(1),
});

export const recommendationListOutputSchema = z.object({
  summary: z.string().min(1),
  recommendations: z.array(agentRecommendationSchema).default([]),
});

export const dataIngestionOutputSchema = z.object({
  summary: z.string().min(1),
  warnings: z
    .array(
      z.object({
        source: z.string().min(1),
        message: z.string().min(1),
        severity: levelSchema,
      }),
    )
    .default([]),
  recommendedActions: z.array(z.string()).default([]),
});

export const technicalSeoOutputSchema = recommendationListOutputSchema;
export const searchPerformanceOutputSchema = recommendationListOutputSchema;
export const contentOpportunityOutputSchema = recommendationListOutputSchema;
export const onPageSeoOutputSchema = recommendationListOutputSchema;
export const competitiveAnalysisOutputSchema = recommendationListOutputSchema;

export const prioritizationOutputSchema = z.object({
  summary: z.string().min(1),
  prioritizedRecommendations: z
    .array(
      agentRecommendationSchema.extend({
        recommendationId: z.string().optional(),
        score: z.number(),
        rank: z.number().int().positive(),
      }),
    )
    .default([]),
});

export const qaOutputSchema = z.object({
  summary: z.string().min(1),
  reviews: z
    .array(
      z.object({
        recommendationId: z.string().min(1),
        decision: z.enum(["approved", "rejected", "needs_edits"]),
        reason: z.string().min(1),
        suggestedEdits: z.string().optional(),
      }),
    )
    .default([]),
});

export const reportingOutputSchema = z.object({
  summary: z.string().min(1),
  wins: z.array(z.string()).default([]),
  losses: z.array(z.string()).default([]),
  nextMonthPriorities: z.array(z.string()).default([]),
});

export const agentOutputSchemas = {
  dataIngestionOutputSchema,
  technicalSeoOutputSchema,
  searchPerformanceOutputSchema,
  contentOpportunityOutputSchema,
  onPageSeoOutputSchema,
  competitiveAnalysisOutputSchema,
  prioritizationOutputSchema,
  qaOutputSchema,
  reportingOutputSchema,
} as const;

export type AgentOutputSchemaName = keyof typeof agentOutputSchemas;

export function getAgentOutputSchema(schemaName: AgentOutputSchemaName) {
  return agentOutputSchemas[schemaName];
}

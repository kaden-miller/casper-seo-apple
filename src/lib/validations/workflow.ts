import { z } from "zod";

const priorityLevel = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const impactLevel = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const recommendationEditSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  reason: z.string().min(1, "Reason is required"),
  currentValue: z.string().optional(),
  suggestedValue: z.string().optional(),
  priority: priorityLevel,
  impact: impactLevel,
  effort: impactLevel,
  risk: impactLevel,
});

export const completeTaskSchema = z.object({
  afterValue: z.string().optional(),
  completionNotes: z.string().min(1, "Completion notes are required"),
  changeType: z.string().min(1, "Change type is required"),
  fieldChanged: z.string().optional(),
  measureAfterDate: z.string().optional(),
});

export type RecommendationEditValues = z.infer<typeof recommendationEditSchema>;
export type CompleteTaskValues = z.infer<typeof completeTaskSchema>;

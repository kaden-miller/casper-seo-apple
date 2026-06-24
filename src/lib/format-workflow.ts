import type {
  ImpactLevel,
  PriorityLevel,
  RecommendationStatus,
  RecommendationType,
  TaskStatus,
} from "@/generated/prisma/client";

export function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function recommendationStatusVariant(
  status: RecommendationStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "NEEDS_REVIEW":
    case "CONVERTED_TO_TASK":
      return "secondary";
    default:
      return "outline";
  }
}

export function taskStatusVariant(
  status: TaskStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "BLOCKED":
    case "SKIPPED":
      return "destructive";
    case "IN_PROGRESS":
    case "APPROVED":
      return "secondary";
    default:
      return "outline";
  }
}

export function priorityVariant(
  priority: PriorityLevel,
): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case "URGENT":
      return "destructive";
    case "HIGH":
      return "default";
    case "MEDIUM":
      return "secondary";
    default:
      return "outline";
  }
}

export function impactVariant(
  impact: ImpactLevel,
): "default" | "secondary" | "outline" {
  switch (impact) {
    case "HIGH":
      return "default";
    case "MEDIUM":
      return "secondary";
    default:
      return "outline";
  }
}

export function recommendationTypeLabel(type: RecommendationType): string {
  return formatEnumLabel(type);
}

import type { MonthlyReportRecommendationsPayload } from "@/lib/reports/types";

export function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function parseReportPayload(
  value: unknown,
): MonthlyReportRecommendationsPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as MonthlyReportRecommendationsPayload;
}

export function parseTaskSnapshots(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      "id" in item &&
      "title" in item &&
      typeof (item as { id: unknown }).id === "string",
  ) as Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    url: string | null;
    completedAt: string | null;
  }>;
}

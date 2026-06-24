import { buildMonthlyReportData } from "@/lib/reports/report-data";

export async function buildReportingInput(
  websiteId: string,
  year: number,
  month: number,
): Promise<Record<string, unknown>> {
  return buildMonthlyReportData(websiteId, year, month);
}

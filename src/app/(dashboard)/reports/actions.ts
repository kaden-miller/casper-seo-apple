"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAiConfigured } from "@/lib/ai/agent-model-config";
import { getWebsiteForUser } from "@/lib/data/seo";
import { generateMonthlyReport } from "@/lib/reports/generate-monthly-report";
import { defaultReportPeriod } from "@/lib/reports/month-period";

type GenerateReportResult = {
  error?: string;
  reportId?: string;
};

function revalidateReportPaths(websiteId: string, reportId?: string) {
  revalidatePath("/reports");
  revalidatePath(`/websites/${websiteId}`);
  if (reportId) {
    revalidatePath(`/reports/${reportId}`);
  }
}

export async function generateWebsiteMonthlyReport(
  websiteId: string,
  year?: number,
  month?: number,
): Promise<GenerateReportResult> {
  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  if (!isAiConfigured()) {
    return { error: "OPENAI_API_KEY is not configured" };
  }

  const period = defaultReportPeriod();
  const reportYear = year ?? period.year;
  const reportMonth = month ?? period.month;

  try {
    const result = await generateMonthlyReport(
      websiteId,
      reportYear,
      reportMonth,
    );

    if (result.error || !result.reportId) {
      return {
        error: result.error ?? result.validationError ?? "Report generation failed",
      };
    }

    revalidateReportPaths(websiteId, result.reportId);
    redirect(`/reports/${result.reportId}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Report generation failed",
    };
  }
}

import type { reportingOutputSchema } from "@/lib/agents/schemas";
import { runAgent } from "@/lib/agents/run-agent";
import { getWebsiteForUser } from "@/lib/data/seo";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { buildMonthlyReportData } from "@/lib/reports/report-data";
import { getMonthPeriod } from "@/lib/reports/month-period";
import type { MonthlyReportRecommendationsPayload } from "@/lib/reports/types";
import type { z } from "zod";

type ReportingOutput = z.infer<typeof reportingOutputSchema>;

export type GenerateMonthlyReportResult = {
  error?: string;
  reportId?: string;
  agentRunId?: string;
  status?: "SUCCESS" | "FAILED" | "VALIDATION_FAILED";
  validationError?: string | null;
};

export async function generateMonthlyReport(
  websiteId: string,
  year: number,
  month: number,
): Promise<GenerateMonthlyReportResult> {
  if (month < 1 || month > 12) {
    return { error: "Month must be between 1 and 12" };
  }

  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  const structuredData = await buildMonthlyReportData(websiteId, year, month);
  const period = getMonthPeriod(year, month);

  const agentResult = await runAgent({
    agentName: "reportingAgent",
    websiteId,
    clientId: website.clientId,
    input: structuredData,
    metadata: {
      source: "monthly-report",
      year,
      month,
    },
  });

  if (agentResult.status !== "SUCCESS" || !agentResult.parsedOutput) {
    return {
      agentRunId: agentResult.agentRunId,
      status: agentResult.status,
      validationError: agentResult.validationError,
      error:
        agentResult.errorMessage ??
        agentResult.validationError ??
        "Report agent failed",
    };
  }

  const agentOutput = agentResult.parsedOutput as ReportingOutput;

  const recommendationsPayload: MonthlyReportRecommendationsPayload = {
    ...structuredData,
    agentWins: agentOutput.wins,
    agentLosses: agentOutput.losses,
  };

  const winsPayload = [
    ...agentOutput.wins,
    ...structuredData.topWinningPages.map(
      (page) =>
        `Page win: ${page.url} (+${page.clicksDelta} clicks, ${page.impressionsDelta >= 0 ? "+" : ""}${page.impressionsDelta} impressions)`,
    ),
  ];

  const lossesPayload = [
    ...agentOutput.losses,
    ...structuredData.topDecliningPages.map(
      (page) =>
        `Page decline: ${page.url} (${page.clicksDelta} clicks, ${page.impressionsDelta} impressions)`,
    ),
  ];

  const report = await prisma.monthlyReport.upsert({
    where: {
      websiteId_month_year: {
        websiteId,
        month,
        year,
      },
    },
    create: {
      websiteId,
      clientId: website.clientId,
      month,
      year,
      dateStart: period.dateStart,
      dateEnd: period.dateEnd,
      summary: agentOutput.summary,
      wins: winsPayload as Prisma.InputJsonValue,
      losses: lossesPayload as Prisma.InputJsonValue,
      completedTasks: structuredData.completedTasks as Prisma.InputJsonValue,
      openTasks: structuredData.openTasks as Prisma.InputJsonValue,
      recommendations: recommendationsPayload as Prisma.InputJsonValue,
      nextMonthPriorities:
        agentOutput.nextMonthPriorities as Prisma.InputJsonValue,
      generatedAt: new Date(),
    },
    update: {
      summary: agentOutput.summary,
      wins: winsPayload as Prisma.InputJsonValue,
      losses: lossesPayload as Prisma.InputJsonValue,
      completedTasks: structuredData.completedTasks as Prisma.InputJsonValue,
      openTasks: structuredData.openTasks as Prisma.InputJsonValue,
      recommendations: recommendationsPayload as Prisma.InputJsonValue,
      nextMonthPriorities:
        agentOutput.nextMonthPriorities as Prisma.InputJsonValue,
      generatedAt: new Date(),
    },
  });

  return {
    reportId: report.id,
    agentRunId: agentResult.agentRunId,
    status: "SUCCESS",
  };
}

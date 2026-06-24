import Link from "next/link";
import { GenerateReportForm } from "@/components/reports/generate-report-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMonthLabel } from "@/lib/reports/month-period";
import type { MonthlyReport } from "@/generated/prisma/client";

type MonthlyReportsPanelProps = {
  websiteId: string;
  websiteName: string;
  clientName: string;
  reports: MonthlyReport[];
  defaultYear: number;
  defaultMonth: number;
  aiConfigured: boolean;
};

export function MonthlyReportsPanel({
  websiteId,
  websiteName,
  clientName,
  reports,
  defaultYear,
  defaultMonth,
  aiConfigured,
}: MonthlyReportsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly reports</CardTitle>
        <CardDescription>
          Generate a report from stored GSC, GA4, task, and recommendation data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <GenerateReportForm
          websites={[{ id: websiteId, name: websiteName, clientName }]}
          defaultYear={defaultYear}
          defaultMonth={defaultMonth}
          aiConfigured={aiConfigured}
          preselectedWebsiteId={websiteId}
        />

        {reports.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Recent reports</p>
            <ul className="space-y-2">
              {reports.slice(0, 5).map((report) => (
                <li
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {formatMonthLabel(report.year, report.month)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Generated {report.generatedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Report</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/reports/${report.id}`} />}
                    >
                      View
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No monthly reports yet for this website.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

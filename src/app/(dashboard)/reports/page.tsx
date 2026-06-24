import Link from "next/link";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isAiConfigured } from "@/lib/ai/agent-model-config";
import { listWebsitesForUser } from "@/lib/data/seo";
import { defaultReportPeriod, formatMonthLabel } from "@/lib/reports/month-period";
import { monthlyReportRepository } from "@/lib/repositories";

export default async function ReportsPage() {
  const [reports, websites] = await Promise.all([
    monthlyReportRepository.listForOrganization(),
    listWebsitesForUser(),
  ]);

  const defaultPeriod = defaultReportPeriod();
  const websiteOptions = websites.map((website) => ({
    id: website.id,
    name: website.name,
    clientName: website.client.name,
  }));

  return (
    <>
      <DashboardHeader
        title="Monthly reports"
        description="Generate and review monthly SEO performance reports."
      />
      <DashboardContent>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate report</CardTitle>
              <CardDescription>
                Uses stored GSC, GA4, tasks, and recommendations. The reporting
                agent writes the executive summary and priorities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenerateReportForm
                websites={websiteOptions}
                defaultYear={defaultPeriod.year}
                defaultMonth={defaultPeriod.month}
                aiConfigured={isAiConfigured()}
              />
            </CardContent>
          </Card>

          {reports.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No reports yet</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Generate a monthly report for a website to see performance,
                completed work, and next-month priorities.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {formatMonthLabel(report.year, report.month)}
                      </TableCell>
                      <TableCell>{report.website.client.name}</TableCell>
                      <TableCell>{report.website.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.generatedAt.toLocaleDateString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          render={<Link href={`/reports/${report.id}`} />}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </DashboardContent>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
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
import {
  formatEnumLabel,
  priorityVariant,
} from "@/lib/format-workflow";
import {
  parseReportPayload,
  parseStringArray,
  parseTaskSnapshots,
} from "@/lib/reports/parse-report";
import { formatMonthLabel } from "@/lib/reports/month-period";
import { monthlyReportRepository } from "@/lib/repositories";

type ReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDelta(value: number | null | undefined) {
  if (value == null) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatMetricValue(
  value: number | null | undefined,
  style: "number" | "percent" | "position" = "number",
) {
  if (value == null) {
    return "—";
  }

  if (style === "percent") {
    return `${(value * 100).toFixed(2)}%`;
  }

  if (style === "position") {
    return value.toFixed(1);
  }

  return value.toLocaleString();
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;
  const report = await monthlyReportRepository.getById(id);

  if (!report) {
    notFound();
  }

  const payload = parseReportPayload(report.recommendations);
  const wins = parseStringArray(report.wins);
  const losses = parseStringArray(report.losses);
  const priorities = parseStringArray(report.nextMonthPriorities);
  const completedTasks = parseTaskSnapshots(report.completedTasks);
  const openTasks = parseTaskSnapshots(report.openTasks);

  return (
    <>
      <DashboardHeader
        title={`${formatMonthLabel(report.year, report.month)} report`}
        description={`${report.website.client.name} · ${report.website.name}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              render={<Link href={`/websites/${report.websiteId}`} />}
            >
              Website
            </Button>
            <Button variant="outline" render={<Link href="/reports" />}>
              All reports
            </Button>
          </div>
        }
      />
      <DashboardContent>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Executive summary</CardTitle>
              <CardDescription>
                Generated {report.generatedAt.toLocaleString()} · Period{" "}
                {report.dateStart.toLocaleDateString()} –{" "}
                {report.dateEnd.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {report.summary}
              </p>
            </CardContent>
          </Card>

          {payload?.performance ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Search Console performance</CardTitle>
                  {payload.performance.comparisonNote ? (
                    <CardDescription>
                      {payload.performance.comparisonNote}
                    </CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent>
                  {payload.performance.gsc.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Current</TableHead>
                          <TableHead>Previous</TableHead>
                          <TableHead>Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payload.performance.gsc.map((metric) => (
                          <TableRow key={metric.label}>
                            <TableCell>{metric.label}</TableCell>
                            <TableCell>
                              {formatMetricValue(
                                metric.current,
                                metric.label.includes("CTR")
                                  ? "percent"
                                  : metric.label.includes("position")
                                    ? "position"
                                    : "number",
                              )}
                            </TableCell>
                            <TableCell>
                              {formatMetricValue(
                                metric.previous,
                                metric.label.includes("CTR")
                                  ? "percent"
                                  : metric.label.includes("position")
                                    ? "position"
                                    : "number",
                              )}
                            </TableCell>
                            <TableCell>{formatDelta(metric.deltaPercent)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No GSC data in this report.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>GA4 organic performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {payload.performance.ga4.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Current</TableHead>
                          <TableHead>Previous</TableHead>
                          <TableHead>Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payload.performance.ga4.map((metric) => (
                          <TableRow key={metric.label}>
                            <TableCell>{metric.label}</TableCell>
                            <TableCell>
                              {formatMetricValue(
                                metric.current,
                                metric.label.includes("rate") ? "percent" : "number",
                              )}
                            </TableCell>
                            <TableCell>
                              {formatMetricValue(
                                metric.previous,
                                metric.label.includes("rate") ? "percent" : "number",
                              )}
                            </TableCell>
                            <TableCell>{formatDelta(metric.deltaPercent)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No GA4 data in this report.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Wins</CardTitle>
              </CardHeader>
              <CardContent>
                {wins.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {wins.map((win, index) => (
                      <li key={`${win}-${index}`} className="list-disc pl-4">
                        {win}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No wins recorded.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Losses & declines</CardTitle>
              </CardHeader>
              <CardContent>
                {losses.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {losses.map((loss, index) => (
                      <li key={`${loss}-${index}`} className="list-disc pl-4">
                        {loss}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No losses recorded.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {payload?.topWinningPages && payload.topWinningPages.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Top winning pages</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Clicks Δ</TableHead>
                      <TableHead>Impressions Δ</TableHead>
                      <TableHead>Position Δ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payload.topWinningPages.map((page) => (
                      <TableRow key={page.url}>
                        <TableCell className="max-w-sm truncate">{page.url}</TableCell>
                        <TableCell>+{page.clicksDelta}</TableCell>
                        <TableCell>
                          {page.impressionsDelta >= 0 ? "+" : ""}
                          {page.impressionsDelta}
                        </TableCell>
                        <TableCell>{page.positionDelta.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          {payload?.topDecliningPages && payload.topDecliningPages.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Top declining pages</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Clicks Δ</TableHead>
                      <TableHead>Impressions Δ</TableHead>
                      <TableHead>Position Δ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payload.topDecliningPages.map((page) => (
                      <TableRow key={page.url}>
                        <TableCell className="max-w-sm truncate">{page.url}</TableCell>
                        <TableCell>{page.clicksDelta}</TableCell>
                        <TableCell>{page.impressionsDelta}</TableCell>
                        <TableCell>{page.positionDelta.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Completed tasks ({completedTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {completedTasks.length > 0 ? (
                  <ul className="space-y-3 text-sm">
                    {completedTasks.map((task) => (
                      <li key={task.id}>
                        <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                          {task.title}
                        </Link>
                        {task.completedAt ? (
                          <p className="text-xs text-muted-foreground">
                            Completed {new Date(task.completedAt).toLocaleDateString()}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tasks completed during this period.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open tasks ({openTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {openTasks.length > 0 ? (
                  <ul className="space-y-3 text-sm">
                    {openTasks.map((task) => (
                      <li key={task.id} className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                            {task.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {formatEnumLabel(task.status)}
                          </p>
                        </div>
                        <Badge variant={priorityVariant(task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}>
                          {task.priority}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No open tasks.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {payload?.openRecommendations && payload.openRecommendations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations for next month</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payload.openRecommendations.map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/recommendations/${rec.id}`}
                            className="hover:underline"
                          >
                            {rec.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priorityVariant(rec.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}>
                            {rec.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{rec.impact}</TableCell>
                        <TableCell>{formatEnumLabel(rec.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          {priorities.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Next month priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal space-y-2 pl-5 text-sm">
                  {priorities.map((priority, index) => (
                    <li key={`${priority}-${index}`}>{priority}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ) : null}

          {payload?.itemsToMonitor && payload.itemsToMonitor.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Items to monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {payload.itemsToMonitor.map((item, index) => (
                    <li key={`${item}-${index}`} className="list-disc pl-4">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </DashboardContent>
    </>
  );
}

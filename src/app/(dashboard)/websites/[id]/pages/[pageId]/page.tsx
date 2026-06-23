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
import { ga4Repository, pageRepository } from "@/lib/repositories";
import { formatCommaList } from "@/lib/utils/form";

type PageDetailProps = {
  params: Promise<{ id: string; pageId: string }>;
};

function formatMetric(
  value: number | null | undefined,
  style: "number" | "percent" = "number",
) {
  if (value == null) {
    return "—";
  }

  if (style === "percent") {
    return `${(value * 100).toFixed(2)}%`;
  }

  return value.toLocaleString();
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null) {
    return "—";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

function formatDateRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export default async function WebsitePageDetailPage({ params }: PageDetailProps) {
  const { id: websiteId, pageId } = await params;
  const page = await pageRepository.getById(pageId);

  if (!page || page.websiteId !== websiteId) {
    notFound();
  }

  const snapshot = page.snapshots[0];
  let ga4Metrics = await ga4Repository.getPageMetrics(websiteId, pageId);

  if (!ga4Metrics.current && !ga4Metrics.previous) {
    try {
      const path = new URL(page.normalizedUrl).pathname;
      ga4Metrics = await ga4Repository.getPageMetricsByPath(websiteId, path);
    } catch {
      // keep empty metrics
    }
  }

  return (
    <>
      <DashboardHeader
        title={snapshot?.title ?? page.url}
        description={page.url}
        actions={
          <Button
            variant="outline"
            render={<Link href={`/websites/${websiteId}`} />}
          >
            Back to website
          </Button>
        }
      />
      <DashboardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Crawl data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status code</span>
                <span>{snapshot?.statusCode ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Page status</span>
                <Badge variant="outline">{page.status}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Title</p>
                <p>{snapshot?.title ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Meta description</p>
                <p>{snapshot?.metaDescription ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">H1</p>
                <p>{snapshot?.h1 ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">H2s</p>
                <p>{formatCommaList(snapshot?.h2s) || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Canonical</p>
                <p>{snapshot?.canonicalUrl ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Robots meta</p>
                <p>{snapshot?.robotsMeta ?? "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Word count</span>
                <span>{snapshot?.wordCount ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Internal links</span>
                <span>{snapshot?.internalLinkCount ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">External links</span>
                <span>{snapshot?.externalLinkCount ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Images</span>
                <span>{snapshot?.imageCount ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Images missing alt</span>
                <span>{snapshot?.imagesMissingAltCount ?? "—"}</span>
              </div>
              <div>
                <p className="text-muted-foreground">Schema types</p>
                <p>{formatCommaList(snapshot?.schemaTypes) || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last crawled</p>
                <p>
                  {page.lastCrawledAt
                    ? new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(page.lastCrawledAt)
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>GA4 organic landing page</CardTitle>
            <CardDescription>
              Organic Search sessions for this page from the latest GA4 imports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ga4Metrics.current || ga4Metrics.previous ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3 text-sm">
                  <p className="font-medium">Current 28 days</p>
                  {ga4Metrics.current ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        {formatDateRange(
                          ga4Metrics.current.dateStart,
                          ga4Metrics.current.dateEnd,
                        )}
                      </p>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sessions</span>
                        <span>{formatMetric(ga4Metrics.current.sessions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Users</span>
                        <span>{formatMetric(ga4Metrics.current.users)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Engaged sessions
                        </span>
                        <span>
                          {formatMetric(ga4Metrics.current.engagedSessions)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Engagement rate
                        </span>
                        <span>
                          {formatMetric(
                            ga4Metrics.current.engagementRate,
                            "percent",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Avg engagement time
                        </span>
                        <span>
                          {formatDuration(
                            ga4Metrics.current.averageEngagementTime,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversions</span>
                        <span>
                          {formatMetric(ga4Metrics.current.conversions)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No current-period data</p>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  <p className="font-medium">Previous 28 days</p>
                  {ga4Metrics.previous ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        {formatDateRange(
                          ga4Metrics.previous.dateStart,
                          ga4Metrics.previous.dateEnd,
                        )}
                      </p>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sessions</span>
                        <span>{formatMetric(ga4Metrics.previous.sessions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Users</span>
                        <span>{formatMetric(ga4Metrics.previous.users)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Engaged sessions
                        </span>
                        <span>
                          {formatMetric(ga4Metrics.previous.engagedSessions)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Engagement rate
                        </span>
                        <span>
                          {formatMetric(
                            ga4Metrics.previous.engagementRate,
                            "percent",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Avg engagement time
                        </span>
                        <span>
                          {formatDuration(
                            ga4Metrics.previous.averageEngagementTime,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversions</span>
                        <span>
                          {formatMetric(ga4Metrics.previous.conversions)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No prior-period data</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No GA4 organic landing page data for this URL yet. Connect GA4 on
                the website dashboard and run a sync.
              </p>
            )}
          </CardContent>
        </Card>

        {page.snapshots.length > 1 ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Crawl history</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crawled at</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Words</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {page.snapshots.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(item.createdAt)}
                      </TableCell>
                      <TableCell>{item.statusCode ?? "—"}</TableCell>
                      <TableCell className="max-w-[240px] truncate">
                        {item.title ?? "—"}
                      </TableCell>
                      <TableCell>{item.wordCount ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </DashboardContent>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  createCompetitor,
  createKeyword,
  deleteCompetitor,
  deleteKeyword,
} from "@/app/(dashboard)/websites/actions";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { CompetitorForm } from "@/components/websites/competitor-form";
import { CrawlStatusPanel } from "@/components/websites/crawl-status-panel";
import { Ga4IntegrationPanel } from "@/components/websites/ga4-integration-panel";
import { GscIntegrationPanel } from "@/components/websites/gsc-integration-panel";
import { KeywordForm } from "@/components/websites/keyword-form";
import { PageInventoryTable } from "@/components/websites/page-inventory-table";
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
import { getWebsiteForUser } from "@/lib/data/seo";
import { runWebsiteAnalysis } from "@/lib/analysis";
import { isGoogleOAuthConfigured } from "@/lib/integrations/google/config";
import { ga4Repository, gscRepository, integrationRepository, pageRepository } from "@/lib/repositories";
import { formatCommaList } from "@/lib/utils/form";

type WebsiteDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatCrawlDate(date: Date | null | undefined) {
  if (!date) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMetric(value: number | null | undefined, style: "number" | "percent" | "position" = "number") {
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

function formatDelta(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0%";
  }

  const delta = ((current - previous) / previous) * 100;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
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

export default async function WebsiteDetailPage({
  params,
}: WebsiteDetailPageProps) {
  const { id } = await params;
  const [
    website,
    pages,
    crawlRuns,
    gscIntegration,
    ga4Integration,
    integrationRuns,
    gscSummary,
    ga4Summary,
    analysis,
  ] = await Promise.all([
    getWebsiteForUser(id),
    pageRepository.listWithLatestSnapshot(id),
    pageRepository.listCrawlRuns(id),
    integrationRepository.getByType(id, "GSC"),
    integrationRepository.getByType(id, "GA4"),
    integrationRepository.listRecentRuns(id, 10),
    gscRepository.getDashboardSummary(id),
    ga4Repository.getDashboardSummary(id),
    runWebsiteAnalysis(id),
  ]);

  if (!website) {
    notFound();
  }

  const latestCrawl = crawlRuns[0] ?? null;
  const pagesCrawled = latestCrawl?.pagesCrawled ?? 0;
  const gscConnected =
    gscIntegration?.status === "CONNECTED" || gscIntegration?.status === "ERROR";
  const ga4Connected =
    ga4Integration?.status === "CONNECTED" || ga4Integration?.status === "ERROR";
  const gscRunsFiltered = integrationRuns.filter((run) => run.type === "GSC");
  const ga4RunsFiltered = integrationRuns.filter((run) => run.type === "GA4");
  const currentGsc = gscSummary.current;
  const previousGsc = gscSummary.previous;
  const currentGa4 = ga4Summary.current;
  const previousGa4 = ga4Summary.previous;

  return (
    <>
      <DashboardHeader
        title={website.name}
        description={website.url}
        actions={
          <div className="flex gap-2">
            <Button render={<Link href={`/websites/${website.id}/analysis`} />}>
              View analysis
            </Button>
            <Button
              variant="outline"
              render={<Link href={`/websites/${website.id}/edit`} />}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              render={<Link href={`/clients/${website.clientId}`} />}
            >
              View client
            </Button>
          </div>
        }
      />
      <DashboardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Organic clicks (28d)</CardDescription>
                <CardTitle className="text-3xl">
                  {formatMetric(currentGsc?.clicks)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {currentGsc && previousGsc
                    ? `${formatDelta(currentGsc.clicks, previousGsc.clicks)} vs prior 28d`
                    : gscConnected
                      ? "Sync GSC to load metrics"
                      : "Connect GSC in Phase 4 panel below"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Organic impressions (28d)</CardDescription>
                <CardTitle className="text-3xl">
                  {formatMetric(currentGsc?.impressions)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {currentGsc
                    ? `CTR ${formatMetric(currentGsc.ctr, "percent")} · Avg pos ${formatMetric(currentGsc.avgPosition, "position")}`
                    : "GSC sync populates impressions, CTR, and position"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pages crawled</CardDescription>
                <CardTitle className="text-3xl">{pagesCrawled}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {pages.length} pages in inventory
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Data freshness</CardDescription>
                <CardTitle className="text-base">
                  {latestCrawl ? formatCrawlDate(latestCrawl.finishedAt) : "Not synced"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>GSC</span>
                  <Badge
                    variant={
                      gscIntegration?.status === "CONNECTED"
                        ? "default"
                        : gscIntegration?.status === "ERROR"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {gscIntegration?.status ?? "Not connected"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GA4</span>
                  <Badge
                    variant={
                      ga4Integration?.status === "CONNECTED"
                        ? "default"
                        : ga4Integration?.status === "ERROR"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {ga4Integration?.status ?? "Not connected"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Crawl</span>
                  <Badge
                    variant={
                      latestCrawl?.status === "SUCCESS" ? "default" : "secondary"
                    }
                  >
                    {latestCrawl?.status ?? "Never"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Organic sessions (28d)</CardDescription>
                <CardTitle className="text-3xl">
                  {formatMetric(currentGa4?.sessions)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {currentGa4 && previousGa4
                    ? `${formatDelta(currentGa4.sessions, previousGa4.sessions)} vs prior 28d`
                    : ga4Connected
                      ? "Sync GA4 to load metrics"
                      : "Connect GA4 below"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Organic users (28d)</CardDescription>
                <CardTitle className="text-3xl">
                  {formatMetric(currentGa4?.users)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {currentGa4
                    ? `${formatMetric(currentGa4.engagedSessions)} engaged sessions`
                    : "Organic Search channel only"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Engagement rate (28d)</CardDescription>
                <CardTitle className="text-3xl">
                  {formatMetric(currentGa4?.engagementRate, "percent")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {currentGa4
                    ? `Avg time ${formatDuration(currentGa4.averageEngagementTime)}`
                    : "GA4 sync populates engagement metrics"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Organic conversions (28d)</CardDescription>
                <CardTitle className="text-3xl">
                  {formatMetric(currentGa4?.conversions)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {currentGa4 && previousGa4
                    ? `${formatDelta(currentGa4.conversions, previousGa4.conversions)} vs prior 28d`
                    : "Landing page conversions from Organic Search"}
                </p>
              </CardContent>
            </Card>
          </div>

          <GscIntegrationPanel
            websiteId={website.id}
            integration={gscIntegration}
            runs={gscRunsFiltered}
            oauthConfigured={isGoogleOAuthConfigured()}
          />

          <Ga4IntegrationPanel
            websiteId={website.id}
            integration={ga4Integration}
            runs={ga4RunsFiltered}
            oauthConfigured={isGoogleOAuthConfigured()}
          />

          <Card>
            <CardHeader>
              <CardTitle>SEO analysis</CardTitle>
              <CardDescription>
                Rule-based opportunities and issues from GSC and crawl data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {analysis.summary.total} findings
                </Badge>
                {analysis.summary.high > 0 ? (
                  <Badge variant="destructive">
                    {analysis.summary.high} high priority
                  </Badge>
                ) : null}
                {analysis.summary.medium > 0 ? (
                  <Badge variant="secondary">
                    {analysis.summary.medium} medium
                  </Badge>
                ) : null}
              </div>
              <Button render={<Link href={`/websites/${website.id}/analysis`} />}>
                Open full analysis
              </Button>
            </CardContent>
          </Card>

          {ga4Summary.topLandingPages.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Top organic landing pages</CardTitle>
                <CardDescription>
                  Highest-session organic landing pages from the latest GA4 import.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Path</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Conversions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ga4Summary.topLandingPages.map((row) => (
                      <TableRow key={row.path}>
                        <TableCell className="font-medium">{row.path}</TableCell>
                        <TableCell>{row.sessions.toLocaleString()}</TableCell>
                        <TableCell>{row.users.toLocaleString()}</TableCell>
                        <TableCell>{row.conversions.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          <CrawlStatusPanel
            websiteId={website.id}
            crawlRuns={crawlRuns}
            pageCount={pages.length}
          />

          <PageInventoryTable pages={pages} websiteId={website.id} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Website setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Client</p>
                  <Link
                    href={`/clients/${website.clientId}`}
                    className="hover:underline"
                  >
                    {website.client.name}
                  </Link>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">CMS</p>
                  <p>{website.cmsType ?? "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Primary location
                  </p>
                  <p>{website.primaryLocation ?? "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Service areas
                  </p>
                  <p>{formatCommaList(website.serviceAreas) || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Target services
                  </p>
                  <p>{formatCommaList(website.targetServices) || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Notes</p>
                  <p className="whitespace-pre-wrap">{website.notes ?? "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly review</CardTitle>
                <CardDescription>
                  Placeholder for the monthly SEO workflow.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Upcoming in later phases:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Review analysis findings</li>
                  <li>Generate recommendations</li>
                  <li>Build prioritized task list</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Keywords</CardTitle>
              <CardDescription>Target keywords for this website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <KeywordForm action={createKeyword} websiteId={website.id} />
              {website.keywords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {website.keywords.map((keyword) => (
                      <TableRow key={keyword.id}>
                        <TableCell className="font-medium">
                          {keyword.keyword}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{keyword.priority}</Badge>
                        </TableCell>
                        <TableCell>{keyword.device}</TableCell>
                        <TableCell>{keyword.location ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <form
                            action={deleteKeyword.bind(
                              null,
                              keyword.id,
                              website.id,
                            )}
                          >
                            <Button type="submit" variant="ghost" size="sm">
                              Remove
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No keywords added yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competitors</CardTitle>
              <CardDescription>Competitor domains to monitor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CompetitorForm
                action={createCompetitor}
                websiteId={website.id}
              />
              {website.competitors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {website.competitors.map((competitor) => (
                      <TableRow key={competitor.id}>
                        <TableCell className="font-medium">
                          {competitor.name}
                        </TableCell>
                        <TableCell>{competitor.domain}</TableCell>
                        <TableCell>{competitor.notes ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <form
                            action={deleteCompetitor.bind(
                              null,
                              competitor.id,
                              website.id,
                            )}
                          >
                            <Button type="submit" variant="ghost" size="sm">
                              Remove
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No competitors added yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardContent>
    </>
  );
}

import { Badge } from "@/components/ui/badge";
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
import type { CrawlRun } from "@/generated/prisma/client";
import { RunCrawlButton } from "@/components/websites/run-crawl-button";

type CrawlStatusPanelProps = {
  websiteId: string;
  crawlRuns: CrawlRun[];
  pageCount: number;
};

function statusVariant(status: CrawlRun["status"]) {
  switch (status) {
    case "SUCCESS":
      return "default" as const;
    case "RUNNING":
    case "PENDING":
      return "secondary" as const;
    case "FAILED":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function CrawlStatusPanel({
  websiteId,
  crawlRuns,
  pageCount,
}: CrawlStatusPanelProps) {
  const latestCrawl = crawlRuns[0] ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website crawl</CardTitle>
        <CardDescription>
          Crawl on-page SEO data and build a page inventory.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Pages in inventory</p>
            <p className="text-2xl font-semibold">{pageCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last crawl</p>
            <p className="text-sm font-medium">
              {latestCrawl ? formatDate(latestCrawl.finishedAt ?? latestCrawl.startedAt) : "Never"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last status</p>
            {latestCrawl ? (
              <Badge variant={statusVariant(latestCrawl.status)}>
                {latestCrawl.status}
              </Badge>
            ) : (
              <Badge variant="secondary">Not crawled</Badge>
            )}
          </div>
        </div>

        <RunCrawlButton websiteId={websiteId} />

        {crawlRuns.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Started</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crawlRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>{formatDate(run.startedAt)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {run.pagesCrawled}
                    {run.pagesFound > run.pagesCrawled
                      ? ` / ${run.pagesFound} found`
                      : ""}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {run.errorMessage ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  );
}

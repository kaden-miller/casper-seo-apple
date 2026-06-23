import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { AnalysisFindingsPanel } from "@/components/analysis/analysis-findings-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWebsiteForUser } from "@/lib/data/seo";
import { runWebsiteAnalysis } from "@/lib/analysis";

type WebsiteAnalysisPageProps = {
  params: Promise<{ id: string }>;
};

function formatDateRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export default async function WebsiteAnalysisPage({
  params,
}: WebsiteAnalysisPageProps) {
  const { id } = await params;
  const website = await getWebsiteForUser(id);

  if (!website) {
    notFound();
  }

  const analysis = await runWebsiteAnalysis(id);

  return (
    <>
      <DashboardHeader
        title="SEO analysis"
        description={`Deterministic findings for ${website.name}`}
        actions={
          <Button
            variant="outline"
            render={<Link href={`/websites/${website.id}`} />}
          >
            Back to website
          </Button>
        }
      />
      <DashboardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total findings</CardDescription>
                <CardTitle className="text-3xl">
                  {analysis.summary.total}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>High priority</CardDescription>
                <CardTitle className="text-3xl text-destructive">
                  {analysis.summary.high}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Medium priority</CardDescription>
                <CardTitle className="text-3xl">{analysis.summary.medium}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Data periods</CardDescription>
                <CardTitle className="text-base">
                  {analysis.currentRange
                    ? formatDateRange(
                        analysis.currentRange.dateStart,
                        analysis.currentRange.dateEnd,
                      )
                    : "No GSC data"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {analysis.previousRange
                    ? `Compared to ${formatDateRange(
                        analysis.previousRange.dateStart,
                        analysis.previousRange.dateEnd,
                      )}`
                    : "GSC comparisons need two imported periods"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How this works</CardTitle>
              <CardDescription>
                Rule-based checks on imported GSC and crawl data. No AI required.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="outline">GSC query opportunities</Badge>
              <Badge variant="outline">GSC page performance</Badge>
              <Badge variant="outline">On-page technical issues</Badge>
            </CardContent>
          </Card>

          <AnalysisFindingsPanel analysis={analysis} websiteId={website.id} />
        </div>
      </DashboardContent>
    </>
  );
}

import Link from "next/link";
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
import {
  ANALYSIS_FINDING_LABELS,
  type AnalysisFinding,
  type AnalysisFindingType,
  type WebsiteAnalysisResult,
} from "@/lib/analysis";

type AnalysisFindingsPanelProps = {
  analysis: WebsiteAnalysisResult;
  websiteId: string;
};

const FINDING_TYPE_ORDER: AnalysisFindingType[] = [
  "high_impression_low_ctr",
  "page_click_decline",
  "page_impression_growth_weak_clicks",
  "query_ranking_4_15",
  "query_ranking_16_30",
  "missing_title",
  "missing_meta_description",
  "missing_h1",
  "thin_page",
  "images_missing_alt",
  "duplicate_title",
  "duplicate_meta_description",
];

function severityVariant(severity: AnalysisFinding["severity"]) {
  switch (severity) {
    case "high":
      return "destructive" as const;
    case "medium":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function groupFindings(findings: AnalysisFinding[]) {
  const groups = new Map<AnalysisFindingType, AnalysisFinding[]>();

  for (const type of FINDING_TYPE_ORDER) {
    groups.set(type, []);
  }

  for (const finding of findings) {
    const group = groups.get(finding.type) ?? [];
    group.push(finding);
    groups.set(finding.type, group);
  }

  return FINDING_TYPE_ORDER.map((type) => ({
    type,
    label: ANALYSIS_FINDING_LABELS[type],
    findings: groups.get(type) ?? [],
  }));
}

function formatMetrics(metrics: Record<string, string | number>) {
  return Object.entries(metrics)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

function FindingTarget({
  finding,
  websiteId,
}: {
  finding: AnalysisFinding;
  websiteId: string;
}) {
  if (finding.pageId) {
    return (
      <Link
        href={`/websites/${websiteId}/pages/${finding.pageId}`}
        className="font-medium hover:underline"
      >
        {finding.title}
      </Link>
    );
  }

  if (finding.url) {
    return (
      <a
        href={finding.url}
        target="_blank"
        rel="noreferrer"
        className="font-medium hover:underline"
      >
        {finding.title}
      </a>
    );
  }

  return <span className="font-medium">{finding.title}</span>;
}

export function AnalysisFindingsPanel({
  analysis,
  websiteId,
}: AnalysisFindingsPanelProps) {
  const groups = groupFindings(analysis.findings);

  if (analysis.findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No findings yet</CardTitle>
          <CardDescription>
            Run a website crawl and sync GSC data, then revisit this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) =>
        group.findings.length > 0 ? (
          <Card key={group.type}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>{group.label}</CardTitle>
                  <CardDescription>
                    {group.findings.length.toLocaleString()} finding
                    {group.findings.length === 1 ? "" : "s"}
                  </CardDescription>
                </div>
                <Badge variant="outline">{group.findings.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Metrics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.findings.map((finding, index) => (
                    <TableRow key={`${finding.type}-${finding.title}-${index}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <FindingTarget
                            finding={finding}
                            websiteId={websiteId}
                          />
                          {finding.query ? (
                            <p className="text-xs text-muted-foreground">
                              Query: {finding.query}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md text-sm text-muted-foreground">
                        {finding.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant={severityVariant(finding.severity)}>
                          {finding.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-sm text-xs text-muted-foreground">
                        {Object.keys(finding.metrics).length > 0
                          ? formatMetrics(finding.metrics)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null,
      )}
    </div>
  );
}

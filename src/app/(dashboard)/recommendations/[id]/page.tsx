import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { RecommendationEditForm } from "@/components/recommendations/recommendation-edit-form";
import { RecommendationWorkflowActions } from "@/components/recommendations/recommendation-workflow-actions";
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
  impactVariant,
  priorityVariant,
  recommendationStatusVariant,
  recommendationTypeLabel,
} from "@/lib/format-workflow";
import { recommendationRepository } from "@/lib/repositories";

type RecommendationDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default async function RecommendationDetailPage({
  params,
}: RecommendationDetailPageProps) {
  const { id } = await params;
  const recommendation = await recommendationRepository.getById(id);

  if (!recommendation) {
    notFound();
  }

  const sourceAgents = Array.isArray(recommendation.sourceAgents)
    ? recommendation.sourceAgents.map((entry) =>
        typeof entry === "object" && entry && "agentName" in entry
          ? String((entry as { agentName: string }).agentName)
          : String(entry),
      )
    : [];
  const linkedTask = recommendation.tasks[0];

  return (
    <>
      <DashboardHeader
        title={recommendation.title}
        description={`${recommendation.website.client.name} · ${recommendation.website.name}`}
        actions={
          <Button
            variant="outline"
            render={<Link href="/recommendations" />}
          >
            Back to list
          </Button>
        }
      />
      <DashboardContent>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
              <CardDescription>
                Review this recommendation and decide the next step.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={recommendationStatusVariant(recommendation.status)}>
                  {formatEnumLabel(recommendation.status)}
                </Badge>
                <Badge variant={priorityVariant(recommendation.priority)}>
                  {recommendation.priority}
                </Badge>
                <Badge variant="outline">
                  {recommendationTypeLabel(recommendation.type)}
                </Badge>
                <Badge variant={impactVariant(recommendation.impact)}>
                  Impact {recommendation.impact}
                </Badge>
                <Badge variant="outline">Effort {recommendation.effort}</Badge>
                <Badge variant="outline">Risk {recommendation.risk}</Badge>
                <Badge variant="outline">
                  Confidence {Math.round(recommendation.confidenceScore * 100)}%
                </Badge>
              </div>

              <RecommendationWorkflowActions
                recommendationId={recommendation.id}
                status={recommendation.status}
                hasTask={recommendation.tasks.length > 0}
                taskId={linkedTask?.id}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Description</p>
                  <p className="whitespace-pre-wrap">{recommendation.description}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Reason</p>
                  <p className="whitespace-pre-wrap">{recommendation.reason}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">URL</p>
                  <p>
                    {recommendation.page?.url ? (
                      <Link
                        href={`/websites/${recommendation.websiteId}/pages/${recommendation.pageId}`}
                        className="hover:underline"
                      >
                        {recommendation.page.url}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Current value</p>
                  <p className="whitespace-pre-wrap">
                    {recommendation.currentValue ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Suggested value</p>
                  <p className="whitespace-pre-wrap">
                    {recommendation.suggestedValue ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Source agents</p>
                  <p>{sourceAgents.length > 0 ? sourceAgents.join(", ") : "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Created</p>
                  <p>{recommendation.createdAt.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supporting data</CardTitle>
                <CardDescription>Structured evidence behind this recommendation.</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
                  {formatJson(recommendation.supportingData)}
                </pre>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Edit recommendation</CardTitle>
              <CardDescription>
                Update fields before approving or converting to a task.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecommendationEditForm recommendation={recommendation} />
            </CardContent>
          </Card>

          {recommendation.changeLogs.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Change log</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendation.changeLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.changedAt.toLocaleDateString()}</TableCell>
                        <TableCell>{log.changeType}</TableCell>
                        <TableCell>{log.fieldChanged ?? "—"}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.url}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </DashboardContent>
    </>
  );
}

import Link from "next/link";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import type {
  PriorityLevel,
  RecommendationStatus,
  RecommendationType,
} from "@/generated/prisma/client";
import { listWebsitesForUser } from "@/lib/data/seo";
import {
  formatEnumLabel,
  impactVariant,
  priorityVariant,
  recommendationStatusVariant,
  recommendationTypeLabel,
} from "@/lib/format-workflow";
import { recommendationRepository } from "@/lib/repositories";

type RecommendationsPageProps = {
  searchParams: Promise<{
    websiteId?: string;
    status?: string;
    priority?: string;
    type?: string;
  }>;
};

function parseStatus(value?: string): RecommendationStatus | undefined {
  const options: RecommendationStatus[] = [
    "DETECTED",
    "NEEDS_REVIEW",
    "APPROVED",
    "REJECTED",
    "CONVERTED_TO_TASK",
    "COMPLETED",
    "SKIPPED",
  ];
  return options.includes(value as RecommendationStatus)
    ? (value as RecommendationStatus)
    : undefined;
}

function parsePriority(value?: string): PriorityLevel | undefined {
  const options: PriorityLevel[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  return options.includes(value as PriorityLevel)
    ? (value as PriorityLevel)
    : undefined;
}

function parseType(value?: string): RecommendationType | undefined {
  if (!value) {
    return undefined;
  }

  return value as RecommendationType;
}

export default async function RecommendationsPage({
  searchParams,
}: RecommendationsPageProps) {
  const params = await searchParams;
  const filters = {
    websiteId: params.websiteId,
    status: parseStatus(params.status),
    priority: parsePriority(params.priority),
    type: parseType(params.type),
  };

  const [recommendations, websites] = await Promise.all([
    recommendationRepository.listForOrganization(filters),
    listWebsitesForUser(),
  ]);

  return (
    <>
      <DashboardHeader
        title="Recommendations"
        description="Review, approve, and convert SEO recommendations into tasks."
      />
      <DashboardContent>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="get" className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label htmlFor="websiteId" className="text-xs text-muted-foreground">
                  Website
                </label>
                <select
                  id="websiteId"
                  name="websiteId"
                  defaultValue={params.websiteId ?? ""}
                  className="flex h-8 min-w-48 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">All websites</option>
                  {websites.map((website) => (
                    <option key={website.id} value={website.id}>
                      {website.client.name} — {website.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="status" className="text-xs text-muted-foreground">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={params.status ?? ""}
                  className="flex h-8 min-w-40 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">All statuses</option>
                  {[
                    "DETECTED",
                    "NEEDS_REVIEW",
                    "APPROVED",
                    "REJECTED",
                    "CONVERTED_TO_TASK",
                    "COMPLETED",
                    "SKIPPED",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {formatEnumLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="priority" className="text-xs text-muted-foreground">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  defaultValue={params.priority ?? ""}
                  className="flex h-8 min-w-32 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">All priorities</option>
                  {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" variant="outline">
                Apply
              </Button>
              <Button variant="ghost" render={<Link href="/recommendations" />}>
                Clear
              </Button>
            </form>
          </CardContent>
        </Card>

        {recommendations.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No recommendations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Run SEO agents from a website dashboard to generate recommendations.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="max-w-xs font-medium">
                      <Link
                        href={`/recommendations/${rec.id}`}
                        className="hover:underline"
                      >
                        {rec.title}
                      </Link>
                      {rec.page?.url ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {rec.page.url}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>{rec.website.client.name}</TableCell>
                    <TableCell>{rec.website.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {recommendationTypeLabel(rec.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityVariant(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={impactVariant(rec.impact)}>
                        {rec.impact}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={recommendationStatusVariant(rec.status)}>
                        {formatEnumLabel(rec.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rec.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </DashboardContent>
    </>
  );
}

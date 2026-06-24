"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { runWebsiteAgent } from "@/app/(dashboard)/websites/agent-actions";
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
import type { Recommendation } from "@/generated/prisma/client";

type AgentOption = {
  name: string;
  displayName: string;
};

type RecommendationsPanelProps = {
  websiteId: string;
  recommendations: Recommendation[];
  aiConfigured: boolean;
  agents: AgentOption[];
};

function statusVariant(status: Recommendation["status"]) {
  switch (status) {
    case "APPROVED":
      return "default" as const;
    case "REJECTED":
      return "destructive" as const;
    case "NEEDS_REVIEW":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function RecommendationsPanel({
  websiteId,
  recommendations,
  aiConfigured,
  agents,
}: RecommendationsPanelProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRun(agentName: string) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await runWebsiteAgent(websiteId, agentName);
      if (response.error) {
        setError(response.error);
        return;
      }

      const result = response.result;
      if (!result) {
        return;
      }

      if (result.status === "SUCCESS") {
        const created = result.recommendationsCreated ?? 0;
        const updated = result.recommendationsUpdated ?? 0;
        setMessage(
          `Agent completed. Created ${created} recommendation(s), updated ${updated}.`,
        );
        return;
      }

      if (result.status === "VALIDATION_FAILED") {
        setError(result.validationError ?? "Agent output failed validation");
        return;
      }

      setError(result.errorMessage ?? "Agent run failed");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
        <CardDescription>
          Run SEO agents against live crawl, GSC, and GA4 data. Valid outputs are
          saved as recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!aiConfigured ? (
          <p className="text-sm text-destructive">
            Set OPENAI_API_KEY to run recommendation agents.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {agents.map((agent) => (
            <Button
              key={agent.name}
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending || !aiConfigured}
              onClick={() => handleRun(agent.name)}
            >
              Run {agent.displayName.replace(" Agent", "")}
            </Button>
          ))}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}

        {recommendations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="max-w-sm font-medium">
                    <Link
                      href={`/recommendations/${rec.id}`}
                      className="hover:underline"
                    >
                      {rec.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rec.type}</Badge>
                  </TableCell>
                  <TableCell>{rec.priority}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(rec.status)}>
                      {rec.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{rec.impact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recommendations yet. Run Technical SEO, Search Performance, or
            On-Page SEO agents to generate some.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

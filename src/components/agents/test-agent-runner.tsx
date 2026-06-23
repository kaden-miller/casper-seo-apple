"use client";

import { useMemo, useState, useTransition } from "react";
import { runTestAgent } from "@/app/(dashboard)/agents/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { AgentDefinition, AgentName } from "@/lib/agents";
import type { RunAgentResult } from "@/lib/agents/types";

type WebsiteOption = {
  id: string;
  name: string;
  clientName: string;
};

type TestAgentRunnerProps = {
  websites: WebsiteOption[];
  agents: AgentDefinition[];
  aiConfigured: boolean;
};

const SAMPLE_INPUTS: Record<string, string> = {
  dataIngestionAgent: JSON.stringify({ note: "Check data freshness" }, null, 2),
  technicalSeoAgent: JSON.stringify(
    {
      pages: [
        {
          url: "https://example.com/services",
          title: "",
          metaDescription: null,
          h1: null,
          wordCount: 120,
        },
      ],
    },
    null,
    2,
  ),
  searchPerformanceAgent: JSON.stringify(
    {
      queries: [
        {
          query: "lawn care services",
          impressions: 1200,
          clicks: 12,
          ctr: 0.01,
          avgPosition: 8.4,
        },
      ],
    },
    null,
    2,
  ),
  qaAgent: JSON.stringify(
    {
      recommendations: [
        {
          id: "rec_123",
          title: "Improve meta description",
          description: "Page is missing a meta description.",
        },
      ],
    },
    null,
    2,
  ),
  prioritizationAgent: JSON.stringify(
    {
      recommendations: [
        {
          title: "Fix missing title tag",
          priority: "high",
          impact: "medium",
          effort: "low",
        },
      ],
    },
    null,
    2,
  ),
  reportingAgent: JSON.stringify(
    {
      period: { month: 6, year: 2026 },
      metrics: { clicks: 1200, sessions: 900 },
    },
    null,
    2,
  ),
};

function statusVariant(status: RunAgentResult["status"]) {
  switch (status) {
    case "SUCCESS":
      return "default" as const;
    case "VALIDATION_FAILED":
      return "secondary" as const;
    default:
      return "destructive" as const;
  }
}

export function TestAgentRunner({
  websites,
  agents,
  aiConfigured,
}: TestAgentRunnerProps) {
  const [websiteId, setWebsiteId] = useState(websites[0]?.id ?? "");
  const [agentName, setAgentName] = useState<AgentName>(
    agents[0]?.name ?? "dataIngestionAgent",
  );
  const [inputJson, setInputJson] = useState(
    SAMPLE_INPUTS[agents[0]?.name ?? ""] ?? "{}",
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunAgentResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.name === agentName),
    [agents, agentName],
  );

  function handleAgentChange(nextAgent: AgentName) {
    setAgentName(nextAgent);
    setInputJson(SAMPLE_INPUTS[nextAgent] ?? "{}");
    setResult(null);
    setError(null);
  }

  function handleRun() {
    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await runTestAgent(websiteId, agentName, inputJson);
      if (response.error) {
        setError(response.error);
        return;
      }

      setResult(response.result ?? null);
    });
  }

  return (
    <div className="space-y-6">
      {!aiConfigured ? (
        <Card>
          <CardHeader>
            <CardTitle>OpenAI not configured</CardTitle>
            <CardDescription>
              Set OPENAI_API_KEY in your environment to run LLM agents. The
              data ingestion agent runs without an API key.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Run test agent</CardTitle>
          <CardDescription>
            Pick a website and agent, provide JSON input, and inspect the stored
            AgentRun output.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="test-website">Website</Label>
              <select
                id="test-website"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                value={websiteId}
                onChange={(event) => setWebsiteId(event.target.value)}
                disabled={isPending}
              >
                {websites.map((website) => (
                  <option key={website.id} value={website.id}>
                    {website.name} — {website.clientName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-agent">Agent</Label>
              <select
                id="test-agent"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                value={agentName}
                onChange={(event) =>
                  handleAgentChange(event.target.value as AgentName)
                }
                disabled={isPending}
              >
                {agents.map((agent) => (
                  <option key={agent.name} value={agent.name}>
                    {agent.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedAgent ? (
            <p className="text-sm text-muted-foreground">
              {selectedAgent.description} · Mode:{" "}
              <Badge variant="outline">{selectedAgent.executionMode}</Badge>
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="test-input">Input JSON</Label>
            <textarea
              id="test-input"
              className="min-h-[220px] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-xs"
              value={inputJson}
              onChange={(event) => setInputJson(event.target.value)}
              disabled={isPending}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="button" onClick={handleRun} disabled={isPending || !websiteId}>
            {isPending ? "Running…" : "Run agent"}
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Run result</CardTitle>
            <CardDescription>AgentRun ID: {result.agentRunId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
              {result.provider ? (
                <Badge variant="outline">Provider: {result.provider}</Badge>
              ) : null}
              {result.model ? (
                <Badge variant="outline">Model: {result.model}</Badge>
              ) : null}
            </div>

            {result.errorMessage ? (
              <div>
                <p className="mb-2 text-sm font-medium text-destructive">Error</p>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                  {result.errorMessage}
                </pre>
              </div>
            ) : null}

            {result.validationError ? (
              <div>
                <p className="mb-2 text-sm font-medium text-destructive">
                  Validation error
                </p>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                  {result.validationError}
                </pre>
              </div>
            ) : null}

            {result.rawOutput ? (
              <div>
                <p className="mb-2 text-sm font-medium">Raw output</p>
                <pre className="max-h-[320px] overflow-auto rounded-md bg-muted p-3 text-xs">
                  {result.rawOutput}
                </pre>
              </div>
            ) : null}

            {result.parsedOutput ? (
              <div>
                <p className="mb-2 text-sm font-medium">Parsed output</p>
                <pre className="max-h-[320px] overflow-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(result.parsedOutput, null, 2)}
                </pre>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

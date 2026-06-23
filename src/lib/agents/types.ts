import type { AgentType } from "@/generated/prisma/client";
import type { z } from "zod";
import type { AgentOutputSchemaName } from "./schemas";

export type AgentName =
  | "dataIngestionAgent"
  | "technicalSeoAgent"
  | "searchPerformanceAgent"
  | "contentOpportunityAgent"
  | "onPageSeoAgent"
  | "competitiveAnalysisAgent"
  | "prioritizationAgent"
  | "qaAgent"
  | "reportingAgent";

export type AgentExecutionMode = "llm" | "system";

export type AgentDefinition = {
  name: AgentName;
  displayName: string;
  description: string;
  promptFile: string | null;
  outputSchemaName: AgentOutputSchemaName;
  defaultModelConfigKey: AgentName;
  executionMode: AgentExecutionMode;
  enabled: boolean;
};

export type RunAgentParams = {
  agentName: AgentName;
  websiteId: string;
  clientId?: string;
  input: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type RunAgentResult = {
  agentRunId: string;
  agentName: AgentName;
  status: "SUCCESS" | "FAILED" | "VALIDATION_FAILED";
  provider: string | null;
  model: string | null;
  rawOutput: string | null;
  parsedOutput: unknown | null;
  validationError: string | null;
  errorMessage: string | null;
};

export const AGENT_NAME_TO_TYPE: Record<AgentName, AgentType> = {
  dataIngestionAgent: "DATA_INGESTION",
  technicalSeoAgent: "TECHNICAL_SEO",
  searchPerformanceAgent: "SEARCH_PERFORMANCE",
  contentOpportunityAgent: "CONTENT_OPPORTUNITY",
  onPageSeoAgent: "ON_PAGE_SEO",
  competitiveAnalysisAgent: "COMPETITOR_ANALYSIS",
  prioritizationAgent: "PRIORITIZATION",
  qaAgent: "QA",
  reportingAgent: "REPORTING",
};

export type ParsedAgentOutput<T extends z.ZodTypeAny = z.ZodTypeAny> =
  z.infer<T>;

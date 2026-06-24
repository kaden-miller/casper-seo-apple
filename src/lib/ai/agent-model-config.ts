import type { AgentName } from "@/lib/agents/types";
import { reasoningEffortFromEnv } from "./reasoning-effort";
import type { AgentModelConfig } from "./types";

function modelFromEnv(
  envKey: string,
  fallback = process.env.DEFAULT_AI_MODEL ?? "gpt-4.1-mini",
): string {
  return process.env[envKey] ?? fallback;
}

export const agentModelConfig: Record<AgentName, AgentModelConfig> = {
  dataIngestionAgent: {
    provider: "openai",
    model: modelFromEnv("DATA_INGESTION_MODEL", "gpt-4.1-mini"),
    temperature: 0.1,
    maxTokens: 2000,
    reasoningEffort: reasoningEffortFromEnv("DATA_INGESTION_REASONING_EFFORT"),
    promptVersion: "v1",
    enabled: true,
  },
  technicalSeoAgent: {
    provider: "openai",
    model: modelFromEnv("TECHNICAL_SEO_MODEL"),
    temperature: 0.2,
    maxTokens: 4000,
    reasoningEffort: reasoningEffortFromEnv("TECHNICAL_SEO_REASONING_EFFORT"),
    promptVersion: "v1",
    enabled: true,
  },
  searchPerformanceAgent: {
    provider: "openai",
    model: modelFromEnv("SEARCH_PERFORMANCE_MODEL"),
    temperature: 0.2,
    maxTokens: 5000,
    reasoningEffort: reasoningEffortFromEnv(
      "SEARCH_PERFORMANCE_REASONING_EFFORT",
    ),
    promptVersion: "v1",
    enabled: true,
  },
  contentOpportunityAgent: {
    provider: "openai",
    model: modelFromEnv("CONTENT_OPPORTUNITY_MODEL"),
    temperature: 0.4,
    maxTokens: 6000,
    reasoningEffort: reasoningEffortFromEnv(
      "CONTENT_OPPORTUNITY_REASONING_EFFORT",
    ),
    promptVersion: "v1",
    enabled: true,
  },
  onPageSeoAgent: {
    provider: "openai",
    model: modelFromEnv("ON_PAGE_SEO_MODEL"),
    temperature: 0.4,
    maxTokens: 6000,
    reasoningEffort: reasoningEffortFromEnv("ON_PAGE_SEO_REASONING_EFFORT"),
    promptVersion: "v1",
    enabled: true,
  },
  competitiveAnalysisAgent: {
    provider: "openai",
    model: modelFromEnv("COMPETITIVE_ANALYSIS_MODEL"),
    temperature: 0.3,
    maxTokens: 6000,
    reasoningEffort: reasoningEffortFromEnv(
      "COMPETITIVE_ANALYSIS_REASONING_EFFORT",
    ),
    promptVersion: "v1",
    enabled: true,
  },
  prioritizationAgent: {
    provider: "openai",
    model: modelFromEnv("PRIORITIZATION_MODEL"),
    temperature: 0.2,
    maxTokens: 4000,
    reasoningEffort: reasoningEffortFromEnv("PRIORITIZATION_REASONING_EFFORT"),
    promptVersion: "v1",
    enabled: true,
  },
  qaAgent: {
    provider: "openai",
    model: modelFromEnv("QA_AGENT_MODEL"),
    temperature: 0.1,
    maxTokens: 5000,
    reasoningEffort: reasoningEffortFromEnv("QA_AGENT_REASONING_EFFORT"),
    promptVersion: "v1",
    enabled: true,
  },
  reportingAgent: {
    provider: "openai",
    model: modelFromEnv("REPORTING_AGENT_MODEL"),
    temperature: 0.3,
    maxTokens: 6000,
    reasoningEffort: reasoningEffortFromEnv("REPORTING_AGENT_REASONING_EFFORT"),
    promptVersion: "v1",
    enabled: true,
  },
};

export function getAgentModelConfig(agentName: AgentName): AgentModelConfig {
  const config = agentModelConfig[agentName];
  if (!config) {
    throw new Error(`Unknown agent model config: ${agentName}`);
  }

  return config;
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

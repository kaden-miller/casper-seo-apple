import type { AgentDefinition } from "./types";

export const agentRegistry: AgentDefinition[] = [
  {
    name: "dataIngestionAgent",
    displayName: "Data Ingestion Agent",
    description:
      "Verifies whether required data exists and is fresh enough to analyze.",
    promptFile: "data-ingestion-agent.md",
    outputSchemaName: "dataIngestionOutputSchema",
    defaultModelConfigKey: "dataIngestionAgent",
    executionMode: "system",
    enabled: true,
  },
  {
    name: "technicalSeoAgent",
    displayName: "Technical SEO Agent",
    description:
      "Reviews crawl and indexability data to identify technical SEO issues.",
    promptFile: "technical-seo-agent.md",
    outputSchemaName: "technicalSeoOutputSchema",
    defaultModelConfigKey: "technicalSeoAgent",
    executionMode: "llm",
    enabled: true,
  },
  {
    name: "searchPerformanceAgent",
    displayName: "Search Performance Agent",
    description:
      "Analyzes GSC and GA4 data to find search performance opportunities.",
    promptFile: "search-performance-agent.md",
    outputSchemaName: "searchPerformanceOutputSchema",
    defaultModelConfigKey: "searchPerformanceAgent",
    executionMode: "llm",
    enabled: true,
  },
  {
    name: "contentOpportunityAgent",
    displayName: "Content Opportunity Agent",
    description:
      "Identifies content gaps and expansion opportunities from search demand.",
    promptFile: "content-opportunity-agent.md",
    outputSchemaName: "contentOpportunityOutputSchema",
    defaultModelConfigKey: "contentOpportunityAgent",
    executionMode: "llm",
    enabled: true,
  },
  {
    name: "onPageSeoAgent",
    displayName: "On-Page SEO Agent",
    description:
      "Reviews on-page elements and alignment with target keywords and intent.",
    promptFile: "on-page-seo-agent.md",
    outputSchemaName: "onPageSeoOutputSchema",
    defaultModelConfigKey: "onPageSeoAgent",
    executionMode: "llm",
    enabled: true,
  },
  {
    name: "competitiveAnalysisAgent",
    displayName: "Competitive Analysis Agent",
    description:
      "Compares site performance and content against configured competitors.",
    promptFile: "competitive-analysis-agent.md",
    outputSchemaName: "competitiveAnalysisOutputSchema",
    defaultModelConfigKey: "competitiveAnalysisAgent",
    executionMode: "llm",
    enabled: true,
  },
  {
    name: "prioritizationAgent",
    displayName: "Prioritization Agent",
    description:
      "Scores and ranks recommendations by impact, effort, risk, and confidence.",
    promptFile: "prioritization-agent.md",
    outputSchemaName: "prioritizationOutputSchema",
    defaultModelConfigKey: "prioritizationAgent",
    executionMode: "llm",
    enabled: true,
  },
  {
    name: "qaAgent",
    displayName: "QA Agent",
    description:
      "Reviews recommendations for quality, evidence, and actionability.",
    promptFile: "qa-agent.md",
    outputSchemaName: "qaOutputSchema",
    defaultModelConfigKey: "qaAgent",
    executionMode: "llm",
    enabled: true,
  },
  {
    name: "reportingAgent",
    displayName: "Reporting Agent",
    description:
      "Summarizes monthly SEO performance, wins, losses, and next priorities.",
    promptFile: "reporting-agent.md",
    outputSchemaName: "reportingOutputSchema",
    defaultModelConfigKey: "reportingAgent",
    executionMode: "llm",
    enabled: true,
  },
];

export function getAgentDefinition(agentName: string): AgentDefinition {
  const agent = agentRegistry.find((entry) => entry.name === agentName);
  if (!agent) {
    throw new Error(`Unknown agent: ${agentName}`);
  }

  if (!agent.enabled) {
    throw new Error(`Agent is disabled: ${agentName}`);
  }

  return agent;
}

export function listEnabledAgents(): AgentDefinition[] {
  return agentRegistry.filter((agent) => agent.enabled);
}

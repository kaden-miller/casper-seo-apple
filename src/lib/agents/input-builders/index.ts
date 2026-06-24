import type { AgentName } from "@/lib/agents/types";
import { buildOnPageSeoInput } from "./on-page-seo";
import { buildPrioritizationInput } from "./prioritization";
import { buildQaInput } from "./qa";
import { buildReportingInput } from "./reporting";
import { buildSearchPerformanceInput } from "./search-performance";
import { buildTechnicalSeoInput } from "./technical-seo";

export const PHASE_8_AGENTS: AgentName[] = [
  "technicalSeoAgent",
  "searchPerformanceAgent",
  "onPageSeoAgent",
  "prioritizationAgent",
  "qaAgent",
];

export const REPORTING_AGENTS: AgentName[] = ["reportingAgent"];

export type BuildAgentInputOptions = {
  year?: number;
  month?: number;
};

export async function buildAgentInput(
  agentName: AgentName,
  websiteId: string,
  options?: BuildAgentInputOptions,
): Promise<Record<string, unknown>> {
  switch (agentName) {
    case "technicalSeoAgent":
      return buildTechnicalSeoInput(websiteId);
    case "searchPerformanceAgent":
      return buildSearchPerformanceInput(websiteId);
    case "onPageSeoAgent":
      return buildOnPageSeoInput(websiteId);
    case "prioritizationAgent":
      return buildPrioritizationInput(websiteId);
    case "qaAgent":
      return buildQaInput(websiteId);
    case "reportingAgent": {
      if (!options?.year || !options?.month) {
        throw new Error("Reporting agent requires year and month options");
      }
      return buildReportingInput(websiteId, options.year, options.month);
    }
    default:
      throw new Error(`No input builder registered for agent: ${agentName}`);
  }
}

export function agentUsesDatabaseInput(agentName: AgentName): boolean {
  return (
    PHASE_8_AGENTS.includes(agentName) || REPORTING_AGENTS.includes(agentName)
  );
}

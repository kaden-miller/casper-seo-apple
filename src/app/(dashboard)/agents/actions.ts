"use server";

import { revalidatePath } from "next/cache";
import { isAgentName, runAgent, type AgentName } from "@/lib/agents";
import { isAiConfigured } from "@/lib/ai/agent-model-config";
import { getAgentDefinition } from "@/lib/agents/agent-registry";

type RunTestAgentResult = {
  error?: string;
  result?: Awaited<ReturnType<typeof runAgent>>;
};

export async function runTestAgent(
  websiteId: string,
  agentName: string,
  inputJson: string,
): Promise<RunTestAgentResult> {
  if (!isAgentName(agentName)) {
    return { error: "Unknown agent selected" };
  }

  const agent = getAgentDefinition(agentName);

  if (agent.executionMode === "llm" && !isAiConfigured()) {
    return {
      error:
        "OPENAI_API_KEY is not configured. Set it in .env to run LLM agents, or test dataIngestionAgent which runs without an API key.",
    };
  }

  let input: Record<string, unknown> = {};

  if (inputJson.trim()) {
    try {
      const parsed = JSON.parse(inputJson) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { error: "Input must be a JSON object" };
      }
      input = parsed as Record<string, unknown>;
    } catch {
      return { error: "Invalid JSON input" };
    }
  }

  try {
    const result = await runAgent({
      agentName: agentName as AgentName,
      websiteId,
      input,
      metadata: { source: "test-runner" },
    });

    revalidatePath("/agents/test");
    return { result };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Agent run failed",
    };
  }
}

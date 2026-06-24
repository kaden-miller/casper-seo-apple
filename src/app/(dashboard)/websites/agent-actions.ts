"use server";

import { revalidatePath } from "next/cache";
import {
  agentUsesDatabaseInput,
  buildAgentInput,
  isAgentName,
  runAgent,
  type AgentName,
} from "@/lib/agents";
import { isAiConfigured } from "@/lib/ai/agent-model-config";
import { getWebsiteForUser } from "@/lib/data/seo";

type RunWebsiteAgentResult = {
  error?: string;
  result?: Awaited<ReturnType<typeof runAgent>>;
};

function revalidateWebsite(websiteId: string) {
  revalidatePath(`/websites/${websiteId}`);
  revalidatePath("/agents/test");
}

export async function runWebsiteAgent(
  websiteId: string,
  agentName: string,
): Promise<RunWebsiteAgentResult> {
  if (!isAgentName(agentName)) {
    return { error: "Unknown agent" };
  }

  if (!agentUsesDatabaseInput(agentName as AgentName)) {
    return {
      error:
        "This agent is not wired for automatic database input on the website dashboard.",
    };
  }

  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return { error: "Website not found" };
  }

  if (!isAiConfigured()) {
    return { error: "OPENAI_API_KEY is not configured" };
  }

  try {
    const input = await buildAgentInput(agentName as AgentName, websiteId);
    const result = await runAgent({
      agentName: agentName as AgentName,
      websiteId,
      clientId: website.clientId,
      input,
      metadata: { source: "website-dashboard" },
    });

    revalidateWebsite(websiteId);
    return { result };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Agent run failed",
    };
  }
}

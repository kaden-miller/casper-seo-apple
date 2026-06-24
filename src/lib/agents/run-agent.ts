import { getAgentModelConfig } from "@/lib/ai/agent-model-config";
import { extractJsonFromModelOutput, runAiCompletion } from "@/lib/ai/provider";
import { getWebsiteForUser } from "@/lib/data/seo";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { getAgentDefinition } from "./agent-registry";
import { runDataIngestionSystemAgent } from "./system/data-ingestion";
import { loadAgentPrompt } from "./load-prompt";
import { persistAgentOutput } from "./persist-output";
import { getAgentOutputSchema } from "./schemas";
import type { AgentName, RunAgentParams, RunAgentResult } from "./types";
import { AGENT_NAME_TO_TYPE } from "./types";

function formatZodError(error: unknown): string {
  if (error && typeof error === "object" && "issues" in error) {
    return JSON.stringify((error as { issues: unknown }).issues, null, 2);
  }

  return error instanceof Error ? error.message : "Unknown validation error";
}

export async function runAgent(params: RunAgentParams): Promise<RunAgentResult> {
  const agent = getAgentDefinition(params.agentName);
  const website = await getWebsiteForUser(params.websiteId);

  if (!website) {
    throw new Error("Website not found");
  }

  const clientId = params.clientId ?? website.clientId;
  const modelConfig = getAgentModelConfig(agent.defaultModelConfigKey);
  const outputSchema = getAgentOutputSchema(agent.outputSchemaName);
  const inputSummary = JSON.parse(
    JSON.stringify({
      ...params.input,
      metadata: params.metadata ?? {},
    }),
  ) as Prisma.InputJsonValue;

  const agentRun = await prisma.agentRun.create({
    data: {
      websiteId: params.websiteId,
      clientId,
      agentType: AGENT_NAME_TO_TYPE[params.agentName],
      status: "RUNNING",
      provider: agent.executionMode === "llm" ? modelConfig.provider : "system",
      model: agent.executionMode === "llm" ? modelConfig.model : null,
      temperature: agent.executionMode === "llm" ? modelConfig.temperature : null,
      maxTokens: agent.executionMode === "llm" ? modelConfig.maxTokens : null,
      promptVersion: modelConfig.promptVersion,
      inputSummary,
      startedAt: new Date(),
    },
  });

  try {
    if (!modelConfig.enabled) {
      throw new Error(`Agent model config is disabled: ${params.agentName}`);
    }

    let rawOutput: string;

    if (agent.executionMode === "system") {
      rawOutput = await runDataIngestionSystemAgent(params.websiteId, params.input);
    } else {
      const prompt = await loadAgentPrompt(agent.promptFile!);
      const completion = await runAiCompletion({
        model: modelConfig.model,
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens,
        reasoningEffort: modelConfig.reasoningEffort,
        jsonMode: true,
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: JSON.stringify(
              {
                website: {
                  id: website.id,
                  name: website.name,
                  url: website.url,
                  clientId,
                },
                input: params.input,
                metadata: params.metadata ?? {},
              },
              null,
              2,
            ),
          },
        ],
      });

      rawOutput = completion.content;

      if (!rawOutput.trim()) {
        const finishHint = completion.finishReason
          ? `finish_reason=${completion.finishReason}`
          : "no finish reason";
        throw new Error(
          `Model returned empty output (${finishHint}, max_output_tokens=${completion.maxOutputTokens}). ` +
            "For gpt-5/o-series, lower DEFAULT_AI_REASONING_EFFORT (try low or medium) or increase agent maxTokens.",
        );
      }
    }

    const jsonText = extractJsonFromModelOutput(rawOutput);
    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(jsonText);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to parse JSON output";
      const parseDetail =
        jsonText.trim().length === 0
          ? "Model output was empty after extraction."
          : `Received ${jsonText.length} characters.`;

      await prisma.agentRun.update({
        where: { id: agentRun.id },
        data: {
          status: "VALIDATION_FAILED",
          rawOutput,
          validationError: `JSON parse error: ${message}. ${parseDetail}`,
          finishedAt: new Date(),
        },
      });

      return {
        agentRunId: agentRun.id,
        agentName: params.agentName,
        status: "VALIDATION_FAILED",
        provider: agentRun.provider,
        model: agentRun.model,
        rawOutput,
        parsedOutput: null,
        validationError: `JSON parse error: ${message}. ${parseDetail}`,
        errorMessage: null,
      };
    }

    const validation = outputSchema.safeParse(parsedJson);
    if (!validation.success) {
      const validationError = formatZodError(validation.error);

      await prisma.agentRun.update({
        where: { id: agentRun.id },
        data: {
          status: "VALIDATION_FAILED",
          rawOutput,
          validationError,
          finishedAt: new Date(),
        },
      });

      return {
        agentRunId: agentRun.id,
        agentName: params.agentName,
        status: "VALIDATION_FAILED",
        provider: agentRun.provider,
        model: agentRun.model,
        rawOutput,
        parsedOutput: null,
        validationError,
        errorMessage: null,
      };
    }

    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "SUCCESS",
        rawOutput,
        parsedOutput: JSON.parse(
          JSON.stringify(validation.data),
        ) as Prisma.InputJsonValue,
        finishedAt: new Date(),
      },
    });

    const persistResult = await persistAgentOutput(
      params.agentName,
      params.websiteId,
      clientId,
      agentRun.id,
      validation.data,
    );

    return {
      agentRunId: agentRun.id,
      agentName: params.agentName,
      status: "SUCCESS",
      provider: agentRun.provider,
      model: agentRun.model,
      rawOutput,
      parsedOutput: validation.data,
      validationError: null,
      errorMessage: null,
      recommendationsCreated: persistResult.recommendationsCreated,
      recommendationsUpdated: persistResult.recommendationsUpdated,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent run failed";

    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "FAILED",
        errorMessage: message,
        finishedAt: new Date(),
      },
    });

    return {
      agentRunId: agentRun.id,
      agentName: params.agentName,
      status: "FAILED",
      provider: agentRun.provider,
      model: agentRun.model,
      rawOutput: null,
      parsedOutput: null,
      validationError: null,
      errorMessage: message,
    };
  }
}

export function isAgentName(value: string): value is AgentName {
  return [
    "dataIngestionAgent",
    "technicalSeoAgent",
    "searchPerformanceAgent",
    "contentOpportunityAgent",
    "onPageSeoAgent",
    "competitiveAnalysisAgent",
    "prioritizationAgent",
    "qaAgent",
    "reportingAgent",
  ].includes(value);
}

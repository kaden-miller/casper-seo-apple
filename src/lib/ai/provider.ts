import OpenAI from "openai";
import type { AiCompletionRequest, AiCompletionResult } from "./types";

let openaiClient: OpenAI | null = null;

function getOpenAiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

async function runOpenAiCompletion(
  request: AiCompletionRequest,
): Promise<AiCompletionResult> {
  const client = getOpenAiClient();
  const response = await client.chat.completions.create({
    model: request.model,
    temperature: request.temperature,
    max_tokens: request.maxTokens,
    response_format: request.jsonMode ? { type: "json_object" } : undefined,
    messages: request.messages,
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    provider: "openai",
    model: request.model,
  };
}

export async function runAiCompletion(
  request: AiCompletionRequest,
): Promise<AiCompletionResult> {
  return runOpenAiCompletion(request);
}

export function extractJsonFromModelOutput(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  return trimmed;
}

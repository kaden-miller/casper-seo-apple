import type OpenAI from "openai";
import type { ReasoningEffort } from "./reasoning-effort";

function normalizeModelId(model: string): string {
  return model.toLowerCase().split(":")[0]!.trim();
}

/** o-series and gpt-5+ models use different chat completion parameters. */
export function isReasoningCapableModel(model: string): boolean {
  const id = normalizeModelId(model);

  if (/^o\d/.test(id) || id.startsWith("o1") || id.startsWith("o3") || id.startsWith("o4")) {
    return true;
  }

  return id.startsWith("gpt-5");
}

export function resolveReasoningEffort(
  model: string,
  reasoningEffort: ReasoningEffort | undefined,
): ReasoningEffort | undefined {
  if (!reasoningEffort || !isReasoningCapableModel(model)) {
    return undefined;
  }

  return reasoningEffort;
}

const REASONING_TOKEN_MULTIPLIERS: Record<ReasoningEffort, number> = {
  none: 1.25,
  minimal: 2,
  low: 2.5,
  medium: 3.5,
  high: 5,
  xhigh: 8,
};

const REASONING_MIN_OUTPUT_TOKENS: Record<ReasoningEffort, number> = {
  none: 4096,
  minimal: 8192,
  low: 10240,
  medium: 12288,
  high: 16384,
  xhigh: 24576,
};

/**
 * Reasoning models spend max_completion_tokens on hidden reasoning first.
 * Scale the configured budget so structured JSON output is not truncated.
 */
export function resolveMaxOutputTokens(
  model: string,
  maxTokens: number,
  reasoningEffort?: ReasoningEffort,
): number {
  if (!isReasoningCapableModel(model)) {
    return maxTokens;
  }

  const effort = reasoningEffort ?? "medium";
  const scaled = Math.ceil(maxTokens * REASONING_TOKEN_MULTIPLIERS[effort]);
  return Math.max(scaled, REASONING_MIN_OUTPUT_TOKENS[effort]);
}

type CompletionParams = OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

export function buildChatCompletionParams(input: {
  model: string;
  temperature: number;
  maxTokens: number;
  reasoningEffort?: ReasoningEffort;
  jsonMode?: boolean;
  messages: CompletionParams["messages"];
}): CompletionParams {
  const reasoningEffort = resolveReasoningEffort(input.model, input.reasoningEffort);
  const useCompletionTokens = isReasoningCapableModel(input.model);
  const maxOutputTokens = resolveMaxOutputTokens(
    input.model,
    input.maxTokens,
    reasoningEffort,
  );

  const params: CompletionParams = {
    model: input.model,
    messages: input.messages,
    response_format: input.jsonMode ? { type: "json_object" } : undefined,
  };

  if (useCompletionTokens) {
    params.max_completion_tokens = maxOutputTokens;
    if (reasoningEffort) {
      params.reasoning_effort = reasoningEffort;
    }
  } else {
    params.max_tokens = input.maxTokens;
    params.temperature = input.temperature;
  }

  return params;
}

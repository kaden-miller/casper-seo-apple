import type { ReasoningEffort } from "./reasoning-effort";

export type AiProviderName = "openai";

export type { ReasoningEffort };

export type AgentModelConfig = {
  provider: AiProviderName;
  model: string;
  temperature: number;
  maxTokens: number;
  reasoningEffort?: ReasoningEffort;
  promptVersion: string;
  enabled: boolean;
};

export type AiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiCompletionRequest = {
  model: string;
  temperature: number;
  maxTokens: number;
  reasoningEffort?: ReasoningEffort;
  messages: AiChatMessage[];
  jsonMode?: boolean;
};

export type AiCompletionResult = {
  content: string;
  provider: AiProviderName;
  model: string;
  finishReason: string | null;
  maxOutputTokens: number;
};

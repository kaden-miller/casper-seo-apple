export type AiProviderName = "openai";

export type AgentModelConfig = {
  provider: AiProviderName;
  model: string;
  temperature: number;
  maxTokens: number;
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
  messages: AiChatMessage[];
  jsonMode?: boolean;
};

export type AiCompletionResult = {
  content: string;
  provider: AiProviderName;
  model: string;
};

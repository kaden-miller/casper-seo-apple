export const REASONING_EFFORT_VALUES = [
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
] as const;

export type ReasoningEffort = (typeof REASONING_EFFORT_VALUES)[number];

export function parseReasoningEffort(
  raw: string | undefined,
): ReasoningEffort | undefined {
  if (!raw?.trim()) {
    return undefined;
  }

  const normalized = raw.trim().toLowerCase();
  if (!REASONING_EFFORT_VALUES.includes(normalized as ReasoningEffort)) {
    throw new Error(
      `Invalid reasoning effort "${raw}". Expected one of: ${REASONING_EFFORT_VALUES.join(", ")}`,
    );
  }

  return normalized as ReasoningEffort;
}

export function reasoningEffortFromEnv(envKey: string): ReasoningEffort | undefined {
  return parseReasoningEffort(
    process.env[envKey] ?? process.env.DEFAULT_AI_REASONING_EFFORT,
  );
}

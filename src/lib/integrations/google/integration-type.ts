import type { IntegrationType } from "@/generated/prisma/client";

const VALID_INTEGRATION_TYPES = new Set<IntegrationType>(["GSC", "GA4"]);

export function parseIntegrationTypeParam(
  value: string | null,
): IntegrationType | null {
  if (!value || !VALID_INTEGRATION_TYPES.has(value as IntegrationType)) {
    return null;
  }

  return value as IntegrationType;
}

export function integrationConnectedQueryParam(type: IntegrationType): string {
  return type === "GA4" ? "ga4=connected" : "gsc=connected";
}

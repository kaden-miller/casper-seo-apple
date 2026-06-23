import type { IntegrationType } from "@/generated/prisma/client";

export const GSC_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
];

export const GA4_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
];

/** @deprecated Use getOAuthScopesForType instead */
export const GOOGLE_OAUTH_SCOPES = GSC_OAUTH_SCOPES;

export function getOAuthScopesForType(type: IntegrationType): string[] {
  switch (type) {
    case "GSC":
      return GSC_OAUTH_SCOPES;
    case "GA4":
      return GA4_OAUTH_SCOPES;
    default:
      throw new Error(`OAuth is not supported for integration type ${type}`);
  }
}

export function getGoogleOAuthRedirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}/api/integrations/google/callback`;
}

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured",
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri: getGoogleOAuthRedirectUri(),
  };
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.TOKEN_ENCRYPTION_KEY,
  );
}

import type { Credentials } from "google-auth-library";
import { google } from "googleapis";
import type { Integration } from "@/generated/prisma/client";
import { decryptToken, encryptToken } from "@/lib/integrations/crypto";
import { getGoogleOAuthConfig, getOAuthScopesForType } from "./config";
import type { IntegrationType } from "@/generated/prisma/client";

export function createGoogleOAuthClient() {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl(state: string, type: IntegrationType): string {
  const client = createGoogleOAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: getOAuthScopesForType(type),
    state,
  });
}

export async function exchangeGoogleAuthCode(code: string): Promise<Credentials> {
  const client = createGoogleOAuthClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token) {
    throw new Error("Google OAuth did not return an access token");
  }

  return tokens;
}

export function credentialsFromIntegration(integration: Integration): Credentials {
  if (!integration.accessTokenEncrypted) {
    throw new Error("Integration is missing an access token");
  }

  return {
    access_token: decryptToken(integration.accessTokenEncrypted),
    refresh_token: integration.refreshTokenEncrypted
      ? decryptToken(integration.refreshTokenEncrypted)
      : undefined,
    expiry_date: integration.expiresAt?.getTime(),
  };
}

export async function getAuthenticatedGoogleClient(integration: Integration) {
  const client = createGoogleOAuthClient();
  client.setCredentials(credentialsFromIntegration(integration));

  if (client.credentials.expiry_date && client.credentials.expiry_date <= Date.now()) {
    const { credentials } = await client.refreshAccessToken();
    client.setCredentials(credentials);
    return { client, refreshedCredentials: credentials };
  }

  return { client, refreshedCredentials: null };
}

export function encryptedTokensFromCredentials(credentials: Credentials) {
  if (!credentials.access_token) {
    throw new Error("Missing access token in Google credentials");
  }

  return {
    accessTokenEncrypted: encryptToken(credentials.access_token),
    refreshTokenEncrypted: credentials.refresh_token
      ? encryptToken(credentials.refresh_token)
      : undefined,
    expiresAt: credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : null,
  };
}

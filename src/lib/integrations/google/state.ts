import { createHmac, timingSafeEqual } from "crypto";
import type { IntegrationType } from "@/generated/prisma/client";

type OAuthStatePayload = {
  websiteId: string;
  type: IntegrationType;
  nonce: string;
};

function getStateSecret(): string {
  const secret =
    process.env.TOKEN_ENCRYPTION_KEY ?? process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) {
    throw new Error("OAuth state secret is not configured");
  }

  return secret;
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getStateSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createOAuthState(
  websiteId: string,
  type: IntegrationType,
): string {
  const payload: OAuthStatePayload = {
    websiteId,
    type,
    nonce: crypto.randomUUID(),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encoded);

  return `${encoded}.${signature}`;
}

export function parseOAuthState(state: string): OAuthStatePayload | null {
  const [encoded, signature] = state.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = signPayload(encoded);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as OAuthStatePayload;

    if (!payload.websiteId || !payload.type) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

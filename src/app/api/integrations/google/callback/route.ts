import { NextResponse } from "next/server";
import { getWebsiteForUser } from "@/lib/data/seo";
import { prisma } from "@/lib/db";
import {
  encryptedTokensFromCredentials,
  exchangeGoogleAuthCode,
} from "@/lib/integrations/google/oauth";
import { parseOAuthState } from "@/lib/integrations/google/state";
import { integrationConnectedQueryParam } from "@/lib/integrations/google/integration-type";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/websites?error=gsc_oauth_denied`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${origin}/websites?error=gsc_oauth_invalid`,
    );
  }

  const payload = parseOAuthState(state);
  if (!payload) {
    return NextResponse.redirect(
      `${origin}/websites?error=gsc_oauth_state_invalid`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_required`);
  }

  const website = await getWebsiteForUser(payload.websiteId);
  if (!website) {
    return NextResponse.redirect(`${origin}/websites?error=website_not_found`);
  }

  try {
    const credentials = await exchangeGoogleAuthCode(code);
    const encrypted = encryptedTokensFromCredentials(credentials);

    await prisma.integration.upsert({
      where: {
        websiteId_type: {
          websiteId: payload.websiteId,
          type: payload.type,
        },
      },
      create: {
        websiteId: payload.websiteId,
        type: payload.type,
        status: "CONNECTED",
        ...encrypted,
      },
      update: {
        status: "CONNECTED",
        ...encrypted,
      },
    });

    return NextResponse.redirect(
      `${origin}/websites/${payload.websiteId}?${integrationConnectedQueryParam(payload.type)}`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google OAuth failed";

    return NextResponse.redirect(
      `${origin}/websites/${payload.websiteId}?error=${encodeURIComponent(message)}`,
    );
  }
}

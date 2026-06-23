import { NextResponse } from "next/server";
import type { IntegrationType } from "@/generated/prisma/client";
import { getWebsiteForUser } from "@/lib/data/seo";
import { isGoogleOAuthConfigured } from "@/lib/integrations/google/config";
import {
  parseIntegrationTypeParam,
} from "@/lib/integrations/google/integration-type";
import { getGoogleAuthUrl } from "@/lib/integrations/google/oauth";
import { createOAuthState } from "@/lib/integrations/google/state";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const websiteId = searchParams.get("websiteId");
  const type = parseIntegrationTypeParam(searchParams.get("type")) ?? "GSC";

  if (!websiteId) {
    return NextResponse.redirect(
      `${origin}/websites?error=integration_missing_website`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent(request.url)}`,
    );
  }

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      `${origin}/websites/${websiteId}?error=google_oauth_not_configured`,
    );
  }

  const website = await getWebsiteForUser(websiteId);
  if (!website) {
    return NextResponse.redirect(`${origin}/websites?error=website_not_found`);
  }

  const state = createOAuthState(websiteId, type as IntegrationType);
  const authUrl = getGoogleAuthUrl(state, type as IntegrationType);

  return NextResponse.redirect(authUrl);
}

import { google } from "googleapis";
import type { GscAnalyticsRow, GscDimension, GscSite } from "./types";

type GoogleOAuthClient = InstanceType<typeof google.auth.OAuth2>;

const ROW_LIMIT = 25000;

function dimensionsForType(dimension: GscDimension): string[] {
  switch (dimension) {
    case "page":
      return ["page"];
    case "query":
      return ["query"];
    case "query_page":
      return ["query", "page"];
  }
}

function mapRow(
  keys: string[] | null | undefined,
  dimension: GscDimension,
  row: {
    clicks?: number | null;
    impressions?: number | null;
    ctr?: number | null;
    position?: number | null;
  },
): GscAnalyticsRow | null {
  if (!keys?.length) {
    return null;
  }

  const base = {
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  };

  switch (dimension) {
    case "page":
      return { page: keys[0], ...base };
    case "query":
      return { query: keys[0], ...base };
    case "query_page":
      return { query: keys[0], page: keys[1], ...base };
  }
}

export async function listGscSites(client: GoogleOAuthClient): Promise<GscSite[]> {
  const searchconsole = google.searchconsole({ version: "v1", auth: client });
  const response = await searchconsole.sites.list();
  const entries = response.data.siteEntry ?? [];

  return entries
    .filter((entry) => entry.siteUrl)
    .map((entry) => ({
      siteUrl: entry.siteUrl!,
      permissionLevel: entry.permissionLevel,
    }));
}

export async function queryGscSearchAnalytics(
  client: GoogleOAuthClient,
  siteUrl: string,
  dimension: GscDimension,
  startDate: string,
  endDate: string,
): Promise<GscAnalyticsRow[]> {
  const searchconsole = google.searchconsole({ version: "v1", auth: client });
  const dimensions = dimensionsForType(dimension);
  const rows: GscAnalyticsRow[] = [];
  let startRow = 0;

  while (true) {
    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit: ROW_LIMIT,
        startRow,
      },
    });

    const batch = response.data.rows ?? [];
    if (batch.length === 0) {
      break;
    }

    for (const row of batch) {
      const mapped = mapRow(row.keys, dimension, row);
      if (mapped) {
        rows.push(mapped);
      }
    }

    if (batch.length < ROW_LIMIT) {
      break;
    }

    startRow += batch.length;
  }

  return rows;
}

export function formatGscApiError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("User does not have sufficient permission")) {
      return "Google account does not have access to the selected Search Console property.";
    }

    if (message.includes("invalid_grant")) {
      return "Google authorization expired. Reconnect Search Console.";
    }

    return message;
  }

  return "Unknown Google Search Console API error";
}

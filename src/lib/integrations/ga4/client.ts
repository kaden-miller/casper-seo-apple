import { google } from "googleapis";
import type { Ga4LandingPageRow, Ga4Property } from "./types";

type GoogleOAuthClient = InstanceType<typeof google.auth.OAuth2>;

const REPORT_LIMIT = 100_000;

function parseMetricValue(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapLandingPageRow(
  dimensionValues: Array<{ value?: string | null }> | null | undefined,
  metricValues: Array<{ value?: string | null }> | null | undefined,
): Ga4LandingPageRow | null {
  const path = dimensionValues?.[0]?.value;
  if (!path) {
    return null;
  }

  return {
    path,
    sessions: parseMetricValue(metricValues?.[0]?.value),
    users: parseMetricValue(metricValues?.[1]?.value),
    engagedSessions: parseMetricValue(metricValues?.[2]?.value),
    engagementRate: parseMetricValue(metricValues?.[3]?.value),
    averageEngagementTime: parseMetricValue(metricValues?.[4]?.value),
    conversions: parseMetricValue(metricValues?.[5]?.value),
    revenue: metricValues?.[6]?.value
      ? parseMetricValue(metricValues[6].value)
      : null,
  };
}

export async function listGa4Properties(
  client: GoogleOAuthClient,
): Promise<Ga4Property[]> {
  const admin = google.analyticsadmin({ version: "v1beta", auth: client });
  const properties: Ga4Property[] = [];
  let pageToken: string | undefined;

  do {
    const response = await admin.accountSummaries.list({
      pageSize: 200,
      pageToken,
    });

    for (const account of response.data.accountSummaries ?? []) {
      for (const property of account.propertySummaries ?? []) {
        if (!property.property || !property.displayName) {
          continue;
        }

        const propertyId = property.property.replace(/^properties\//, "");
        properties.push({
          propertyId,
          displayName: property.displayName,
          account: account.displayName ?? account.account ?? "Unknown account",
        });
      }
    }

    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return properties;
}

export async function queryOrganicLandingPages(
  client: GoogleOAuthClient,
  propertyId: string,
  startDate: string,
  endDate: string,
): Promise<Ga4LandingPageRow[]> {
  const analyticsData = google.analyticsdata({ version: "v1beta", auth: client });
  const rows: Ga4LandingPageRow[] = [];
  let offset = 0;

  while (true) {
    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "landingPage" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "engagedSessions" },
          { name: "engagementRate" },
          { name: "averageSessionDuration" },
          { name: "conversions" },
          { name: "totalRevenue" },
        ],
        dimensionFilter: {
          filter: {
            fieldName: "sessionDefaultChannelGroup",
            stringFilter: {
              matchType: "EXACT",
              value: "Organic Search",
            },
          },
        },
        limit: String(REPORT_LIMIT),
        offset: String(offset),
      },
    });

    const batch = response.data.rows ?? [];
    if (batch.length === 0) {
      break;
    }

    for (const row of batch) {
      const mapped = mapLandingPageRow(row.dimensionValues, row.metricValues);
      if (mapped) {
        rows.push(mapped);
      }
    }

    if (batch.length < REPORT_LIMIT) {
      break;
    }

    offset += batch.length;
  }

  return rows;
}

export function formatGa4ApiError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("PERMISSION_DENIED")) {
      return "Google account does not have access to the selected GA4 property.";
    }

    if (message.includes("invalid_grant")) {
      return "Google authorization expired. Reconnect Google Analytics.";
    }

    return message;
  }

  return "Unknown Google Analytics API error";
}

export function normalizeGa4PropertyId(input: string): string {
  return input.trim().replace(/^properties\//, "");
}

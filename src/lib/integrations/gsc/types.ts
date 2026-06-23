export type GscDimension = "page" | "query" | "query_page";

export type GscAnalyticsRow = {
  page?: string;
  query?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscSite = {
  siteUrl: string;
  permissionLevel?: string | null;
};

export type AnalysisSeverity = "high" | "medium" | "low";

export type AnalysisCategory =
  | "search_performance"
  | "search_opportunity"
  | "technical_seo";

export type AnalysisFindingType =
  | "high_impression_low_ctr"
  | "page_click_decline"
  | "page_impression_growth_weak_clicks"
  | "query_ranking_4_15"
  | "query_ranking_16_30"
  | "missing_title"
  | "missing_meta_description"
  | "missing_h1"
  | "thin_page"
  | "images_missing_alt"
  | "duplicate_title"
  | "duplicate_meta_description";

export type AnalysisFinding = {
  type: AnalysisFindingType;
  category: AnalysisCategory;
  severity: AnalysisSeverity;
  title: string;
  description: string;
  pageId?: string | null;
  url?: string | null;
  query?: string | null;
  metrics: Record<string, string | number>;
};

export type AnalysisDateRange = {
  dateStart: Date;
  dateEnd: Date;
};

export type GscPageMetricRow = {
  pageId: string | null;
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
};

export type GscQueryMetricRow = {
  query: string;
  pageId: string | null;
  url: string | null;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
};

export type CrawlPageRow = {
  pageId: string;
  url: string;
  normalizedUrl: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  wordCount: number | null;
  imagesMissingAltCount: number | null;
  imageCount: number | null;
};

export type WebsiteAnalysisContext = {
  websiteId: string;
  currentRange: AnalysisDateRange | null;
  previousRange: AnalysisDateRange | null;
  currentPageMetrics: GscPageMetricRow[];
  previousPageMetrics: GscPageMetricRow[];
  currentQueryMetrics: GscQueryMetricRow[];
  crawlPages: CrawlPageRow[];
};

export type WebsiteAnalysisResult = {
  websiteId: string;
  generatedAt: Date;
  currentRange: AnalysisDateRange | null;
  previousRange: AnalysisDateRange | null;
  findings: AnalysisFinding[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<AnalysisFindingType, number>;
  };
};

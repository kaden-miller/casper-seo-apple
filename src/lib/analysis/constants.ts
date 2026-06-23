export const ANALYSIS_THRESHOLDS = {
  minQueryImpressions: 10,
  highImpressionMin: 100,
  lowCtrMax: 0.02,
  clickDeclineMinPreviousClicks: 5,
  clickDeclinePercent: 0.2,
  impressionGrowthMinPrevious: 20,
  impressionGrowthPercent: 0.2,
  weakClickGrowthPercent: 0.1,
  rankingBand4to15Min: 4,
  rankingBand4to15Max: 15,
  rankingBand16to30Min: 16,
  rankingBand16to30Max: 30,
  thinPageWordCount: 300,
  minRankingQueryImpressions: 10,
} as const;

export const ANALYSIS_FINDING_LABELS: Record<
  import("./types").AnalysisFindingType,
  string
> = {
  high_impression_low_ctr: "High impressions, low CTR",
  page_click_decline: "Pages losing clicks",
  page_impression_growth_weak_clicks: "Impression growth, weak click growth",
  query_ranking_4_15: "Queries ranking 4–15",
  query_ranking_16_30: "Queries ranking 16–30",
  missing_title: "Missing title tags",
  missing_meta_description: "Missing meta descriptions",
  missing_h1: "Missing H1 headings",
  thin_page: "Thin content pages",
  images_missing_alt: "Images missing alt text",
  duplicate_title: "Duplicate title tags",
  duplicate_meta_description: "Duplicate meta descriptions",
};

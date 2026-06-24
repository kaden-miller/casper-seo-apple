export type ReportTaskSnapshot = {
  id: string;
  title: string;
  status: string;
  priority: string;
  url: string | null;
  completedAt: string | null;
};

export type ReportRecommendationSnapshot = {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  impact: string;
  pageUrl: string | null;
};

export type ReportPageMovement = {
  url: string;
  pageId: string | null;
  clicksCurrent: number;
  clicksPrevious: number;
  clicksDelta: number;
  impressionsCurrent: number;
  impressionsPrevious: number;
  impressionsDelta: number;
  positionCurrent: number;
  positionPrevious: number;
  positionDelta: number;
};

export type ReportPerformanceMetric = {
  label: string;
  current: number | null;
  previous: number | null;
  deltaPercent: number | null;
};

export type MonthlyReportStructuredData = {
  period: {
    year: number;
    month: number;
    dateStart: string;
    dateEnd: string;
    label: string;
  };
  performance: {
    gsc: ReportPerformanceMetric[];
    ga4: ReportPerformanceMetric[];
    comparisonNote: string | null;
  };
  topWinningPages: ReportPageMovement[];
  topDecliningPages: ReportPageMovement[];
  completedTasks: ReportTaskSnapshot[];
  openTasks: ReportTaskSnapshot[];
  openRecommendations: ReportRecommendationSnapshot[];
  itemsToMonitor: string[];
  changeLogCount: number;
};

export type MonthlyReportRecommendationsPayload = MonthlyReportStructuredData & {
  agentWins?: string[];
  agentLosses?: string[];
};

export type Ga4Property = {
  propertyId: string;
  displayName: string;
  account: string;
};

export type Ga4LandingPageRow = {
  path: string;
  sessions: number;
  users: number;
  engagedSessions: number;
  engagementRate: number;
  averageEngagementTime: number;
  conversions: number;
  revenue: number | null;
};

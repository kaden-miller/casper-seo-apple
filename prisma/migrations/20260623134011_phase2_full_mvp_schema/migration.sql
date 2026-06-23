-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('GSC', 'GA4', 'AHREFS', 'RANK_TRACKER', 'WORDPRESS');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('CONNECTED', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "IntegrationRunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('HOME', 'SERVICE', 'LOCATION', 'BLOG', 'PRODUCT', 'CATEGORY', 'OTHER');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('ACTIVE', 'REDIRECTED', 'NOT_FOUND', 'NOINDEXED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CrawlRunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "BacklinkStatus" AS ENUM ('LIVE', 'LOST', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('TITLE_TAG_OPPORTUNITY', 'META_DESCRIPTION_OPPORTUNITY', 'H1_OPPORTUNITY', 'CONTENT_REFRESH', 'NEW_CONTENT_OPPORTUNITY', 'INTERNAL_LINK_OPPORTUNITY', 'TECHNICAL_ISSUE', 'INDEXING_ISSUE', 'SCHEMA_OPPORTUNITY', 'IMAGE_ALT_OPPORTUNITY', 'KEYWORD_CANNIBALIZATION', 'CTR_OPPORTUNITY', 'RANKING_DROP', 'COMPETITOR_GAP', 'OTHER');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ImpactLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('DETECTED', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'CONVERTED_TO_TASK', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'NEEDS_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('DATA_INGESTION', 'TECHNICAL_SEO', 'SEARCH_PERFORMANCE', 'CONTENT_OPPORTUNITY', 'ON_PAGE_SEO', 'COMPETITOR_ANALYSIS', 'PRIORITIZATION', 'QA', 'REPORTING');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "accountId" TEXT,
    "propertyId" TEXT,
    "siteUrl" TEXT,
    "accessTokenEncrypted" TEXT,
    "refreshTokenEncrypted" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" "IntegrationStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationRun" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "status" "IntegrationRunStatus" NOT NULL DEFAULT 'PENDING',
    "dateStart" TIMESTAMP(3),
    "dateEnd" TIMESTAMP(3),
    "recordsImported" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "pageType" "PageType" NOT NULL DEFAULT 'OTHER',
    "targetKeyword" TEXT,
    "searchIntent" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstDiscoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCrawledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlRun" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "status" "CrawlRunStatus" NOT NULL DEFAULT 'PENDING',
    "startUrl" TEXT NOT NULL,
    "pagesFound" INTEGER NOT NULL DEFAULT 0,
    "pagesCrawled" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrawlRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSnapshot" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "crawlRunId" TEXT NOT NULL,
    "statusCode" INTEGER,
    "finalUrl" TEXT,
    "title" TEXT,
    "metaDescription" TEXT,
    "h1" TEXT,
    "h2s" JSONB NOT NULL DEFAULT '[]',
    "canonicalUrl" TEXT,
    "robotsMeta" TEXT,
    "wordCount" INTEGER,
    "internalLinkCount" INTEGER,
    "externalLinkCount" INTEGER,
    "imageCount" INTEGER,
    "imagesMissingAltCount" INTEGER,
    "schemaTypes" JSONB NOT NULL DEFAULT '[]',
    "rawHtmlHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalLink" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "fromPageId" TEXT NOT NULL,
    "toPageId" TEXT,
    "fromUrl" TEXT NOT NULL,
    "toUrl" TEXT NOT NULL,
    "anchorText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GscPageSnapshot" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "pageId" TEXT,
    "url" TEXT NOT NULL,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GscPageSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GscQuerySnapshot" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "pageId" TEXT,
    "url" TEXT,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GscQuerySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GscQueryPageSnapshot" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "pageId" TEXT,
    "url" TEXT NOT NULL,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GscQueryPageSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ga4LandingPageSnapshot" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "pageId" TEXT,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "users" INTEGER NOT NULL DEFAULT 0,
    "engagedSessions" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageEngagementTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ga4LandingPageSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankSnapshot" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "keywordId" TEXT,
    "keyword" TEXT NOT NULL,
    "location" TEXT,
    "device" "KeywordDevice" NOT NULL DEFAULT 'DESKTOP',
    "searchEngine" TEXT NOT NULL DEFAULT 'google',
    "rankPosition" INTEGER,
    "rankingUrl" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacklinkSnapshot" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "referringDomain" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "anchorText" TEXT,
    "domainRating" DOUBLE PRECISION,
    "firstSeen" TIMESTAMP(3),
    "lastSeen" TIMESTAMP(3),
    "status" "BacklinkStatus" NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BacklinkSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "pageId" TEXT,
    "type" "RecommendationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "currentValue" TEXT,
    "suggestedValue" TEXT,
    "reason" TEXT NOT NULL,
    "supportingData" JSONB NOT NULL DEFAULT '{}',
    "sourceAgents" JSONB NOT NULL DEFAULT '[]',
    "priority" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "impact" "ImpactLevel" NOT NULL DEFAULT 'MEDIUM',
    "effort" "ImpactLevel" NOT NULL DEFAULT 'MEDIUM',
    "risk" "ImpactLevel" NOT NULL DEFAULT 'LOW',
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'DETECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "recommendationId" TEXT,
    "pageId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "humanInstructions" TEXT,
    "url" TEXT,
    "beforeValue" TEXT,
    "afterValue" TEXT,
    "suggestedCopy" TEXT,
    "priority" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "assigneeId" UUID,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeLog" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "taskId" TEXT,
    "recommendationId" TEXT,
    "pageId" TEXT,
    "url" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "fieldChanged" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "reason" TEXT,
    "changedByUserId" UUID,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "measureAfterDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "status" "AgentRunStatus" NOT NULL DEFAULT 'PENDING',
    "inputSummary" JSONB NOT NULL DEFAULT '{}',
    "rawOutput" TEXT,
    "parsedOutput" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "wins" JSONB NOT NULL DEFAULT '[]',
    "losses" JSONB NOT NULL DEFAULT '[]',
    "completedTasks" JSONB NOT NULL DEFAULT '[]',
    "openTasks" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "nextMonthPriorities" JSONB NOT NULL DEFAULT '[]',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Integration_websiteId_idx" ON "Integration"("websiteId");

-- CreateIndex
CREATE INDEX "Integration_status_idx" ON "Integration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_websiteId_type_key" ON "Integration"("websiteId", "type");

-- CreateIndex
CREATE INDEX "IntegrationRun_websiteId_idx" ON "IntegrationRun"("websiteId");

-- CreateIndex
CREATE INDEX "IntegrationRun_integrationId_idx" ON "IntegrationRun"("integrationId");

-- CreateIndex
CREATE INDEX "IntegrationRun_status_idx" ON "IntegrationRun"("status");

-- CreateIndex
CREATE INDEX "Page_websiteId_idx" ON "Page"("websiteId");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Page_websiteId_normalizedUrl_key" ON "Page"("websiteId", "normalizedUrl");

-- CreateIndex
CREATE INDEX "CrawlRun_websiteId_idx" ON "CrawlRun"("websiteId");

-- CreateIndex
CREATE INDEX "CrawlRun_status_idx" ON "CrawlRun"("status");

-- CreateIndex
CREATE INDEX "PageSnapshot_websiteId_idx" ON "PageSnapshot"("websiteId");

-- CreateIndex
CREATE INDEX "PageSnapshot_pageId_idx" ON "PageSnapshot"("pageId");

-- CreateIndex
CREATE INDEX "PageSnapshot_crawlRunId_idx" ON "PageSnapshot"("crawlRunId");

-- CreateIndex
CREATE INDEX "InternalLink_websiteId_idx" ON "InternalLink"("websiteId");

-- CreateIndex
CREATE INDEX "InternalLink_fromPageId_idx" ON "InternalLink"("fromPageId");

-- CreateIndex
CREATE INDEX "InternalLink_toPageId_idx" ON "InternalLink"("toPageId");

-- CreateIndex
CREATE INDEX "GscPageSnapshot_websiteId_dateStart_dateEnd_idx" ON "GscPageSnapshot"("websiteId", "dateStart", "dateEnd");

-- CreateIndex
CREATE INDEX "GscPageSnapshot_pageId_idx" ON "GscPageSnapshot"("pageId");

-- CreateIndex
CREATE INDEX "GscQuerySnapshot_websiteId_dateStart_dateEnd_idx" ON "GscQuerySnapshot"("websiteId", "dateStart", "dateEnd");

-- CreateIndex
CREATE INDEX "GscQuerySnapshot_query_idx" ON "GscQuerySnapshot"("query");

-- CreateIndex
CREATE INDEX "GscQueryPageSnapshot_websiteId_dateStart_dateEnd_idx" ON "GscQueryPageSnapshot"("websiteId", "dateStart", "dateEnd");

-- CreateIndex
CREATE INDEX "GscQueryPageSnapshot_query_idx" ON "GscQueryPageSnapshot"("query");

-- CreateIndex
CREATE INDEX "GscQueryPageSnapshot_url_idx" ON "GscQueryPageSnapshot"("url");

-- CreateIndex
CREATE INDEX "Ga4LandingPageSnapshot_websiteId_dateStart_dateEnd_idx" ON "Ga4LandingPageSnapshot"("websiteId", "dateStart", "dateEnd");

-- CreateIndex
CREATE INDEX "Ga4LandingPageSnapshot_path_idx" ON "Ga4LandingPageSnapshot"("path");

-- CreateIndex
CREATE INDEX "RankSnapshot_websiteId_idx" ON "RankSnapshot"("websiteId");

-- CreateIndex
CREATE INDEX "RankSnapshot_keywordId_idx" ON "RankSnapshot"("keywordId");

-- CreateIndex
CREATE INDEX "RankSnapshot_checkedAt_idx" ON "RankSnapshot"("checkedAt");

-- CreateIndex
CREATE INDEX "BacklinkSnapshot_websiteId_idx" ON "BacklinkSnapshot"("websiteId");

-- CreateIndex
CREATE INDEX "BacklinkSnapshot_referringDomain_idx" ON "BacklinkSnapshot"("referringDomain");

-- CreateIndex
CREATE INDEX "Recommendation_websiteId_idx" ON "Recommendation"("websiteId");

-- CreateIndex
CREATE INDEX "Recommendation_clientId_idx" ON "Recommendation"("clientId");

-- CreateIndex
CREATE INDEX "Recommendation_status_idx" ON "Recommendation"("status");

-- CreateIndex
CREATE INDEX "Recommendation_priority_idx" ON "Recommendation"("priority");

-- CreateIndex
CREATE INDEX "Recommendation_type_idx" ON "Recommendation"("type");

-- CreateIndex
CREATE INDEX "Task_websiteId_idx" ON "Task"("websiteId");

-- CreateIndex
CREATE INDEX "Task_clientId_idx" ON "Task"("clientId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "ChangeLog_websiteId_idx" ON "ChangeLog"("websiteId");

-- CreateIndex
CREATE INDEX "ChangeLog_clientId_idx" ON "ChangeLog"("clientId");

-- CreateIndex
CREATE INDEX "ChangeLog_changedAt_idx" ON "ChangeLog"("changedAt");

-- CreateIndex
CREATE INDEX "AgentRun_websiteId_idx" ON "AgentRun"("websiteId");

-- CreateIndex
CREATE INDEX "AgentRun_agentType_idx" ON "AgentRun"("agentType");

-- CreateIndex
CREATE INDEX "AgentRun_status_idx" ON "AgentRun"("status");

-- CreateIndex
CREATE INDEX "MonthlyReport_clientId_idx" ON "MonthlyReport"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyReport_websiteId_month_year_key" ON "MonthlyReport"("websiteId", "month", "year");

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationRun" ADD CONSTRAINT "IntegrationRun_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationRun" ADD CONSTRAINT "IntegrationRun_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlRun" ADD CONSTRAINT "CrawlRun_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageSnapshot" ADD CONSTRAINT "PageSnapshot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageSnapshot" ADD CONSTRAINT "PageSnapshot_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageSnapshot" ADD CONSTRAINT "PageSnapshot_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "CrawlRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalLink" ADD CONSTRAINT "InternalLink_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalLink" ADD CONSTRAINT "InternalLink_fromPageId_fkey" FOREIGN KEY ("fromPageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalLink" ADD CONSTRAINT "InternalLink_toPageId_fkey" FOREIGN KEY ("toPageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GscPageSnapshot" ADD CONSTRAINT "GscPageSnapshot_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GscPageSnapshot" ADD CONSTRAINT "GscPageSnapshot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GscQuerySnapshot" ADD CONSTRAINT "GscQuerySnapshot_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GscQuerySnapshot" ADD CONSTRAINT "GscQuerySnapshot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GscQueryPageSnapshot" ADD CONSTRAINT "GscQueryPageSnapshot_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GscQueryPageSnapshot" ADD CONSTRAINT "GscQueryPageSnapshot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ga4LandingPageSnapshot" ADD CONSTRAINT "Ga4LandingPageSnapshot_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ga4LandingPageSnapshot" ADD CONSTRAINT "Ga4LandingPageSnapshot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankSnapshot" ADD CONSTRAINT "RankSnapshot_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankSnapshot" ADD CONSTRAINT "RankSnapshot_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacklinkSnapshot" ADD CONSTRAINT "BacklinkSnapshot_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

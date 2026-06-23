# 03 — Database Schema

This file describes the recommended database model. Cursor should translate this into Prisma models.

## Core entities

### User

Represents an app user.

Fields:

- id
- name
- email
- createdAt
- updatedAt

### Organization

Optional but recommended for future team support.

Fields:

- id
- name
- createdAt
- updatedAt

### Client

Represents a client/business.

Fields:

- id
- organizationId
- name
- businessDescription
- industry
- notes
- createdAt
- updatedAt

### Website

Represents one website/property for a client.

Fields:

- id
- clientId
- name
- url
- cmsType
- primaryLocation
- serviceAreas JSON
- targetServices JSON
- notes
- createdAt
- updatedAt

### Integration

Stores connected data sources.

Fields:

- id
- websiteId
- type enum: GSC, GA4, AHREFS, RANK_TRACKER, WORDPRESS
- accountId
- propertyId
- siteUrl
- accessTokenEncrypted
- refreshTokenEncrypted
- expiresAt
- status enum: CONNECTED, ERROR, DISCONNECTED
- lastSyncedAt
- createdAt
- updatedAt

### IntegrationRun

Stores every import attempt.

Fields:

- id
- integrationId
- websiteId
- type
- status enum: PENDING, RUNNING, SUCCESS, FAILED
- dateStart
- dateEnd
- recordsImported
- errorMessage
- startedAt
- finishedAt
- createdAt

## SEO setup entities

### Keyword

Fields:

- id
- websiteId
- keyword
- targetUrl optional
- location optional
- device enum: DESKTOP, MOBILE
- priority enum: LOW, MEDIUM, HIGH
- notes
- createdAt
- updatedAt

### Competitor

Fields:

- id
- websiteId
- name
- domain
- notes
- createdAt
- updatedAt

## Page inventory

### Page

Represents a known URL on the website.

Fields:

- id
- websiteId
- url
- normalizedUrl
- pageType enum: HOME, SERVICE, LOCATION, BLOG, PRODUCT, CATEGORY, OTHER
- targetKeyword optional
- searchIntent optional
- status enum: ACTIVE, REDIRECTED, NOT_FOUND, NOINDEXED, ARCHIVED
- firstDiscoveredAt
- lastCrawledAt
- createdAt
- updatedAt

### PageSnapshot

Stores page data from a crawl at a point in time.

Fields:

- id
- pageId
- websiteId
- crawlRunId
- statusCode
- finalUrl
- title
- metaDescription
- h1
- h2s JSON
- canonicalUrl
- robotsMeta
- wordCount
- internalLinkCount
- externalLinkCount
- imageCount
- imagesMissingAltCount
- schemaTypes JSON
- rawHtmlHash
- createdAt

### CrawlRun

Fields:

- id
- websiteId
- status enum: PENDING, RUNNING, SUCCESS, FAILED
- startUrl
- pagesFound
- pagesCrawled
- errorMessage
- startedAt
- finishedAt
- createdAt

### InternalLink

Fields:

- id
- websiteId
- fromPageId
- toPageId optional
- fromUrl
- toUrl
- anchorText
- createdAt

## Search Console snapshots

### GscPageSnapshot

Stores page-level GSC data by date range.

Fields:

- id
- websiteId
- pageId optional
- url
- dateStart
- dateEnd
- clicks
- impressions
- ctr
- avgPosition
- createdAt

### GscQuerySnapshot

Stores query-level GSC data.

Fields:

- id
- websiteId
- query
- pageId optional
- url optional
- dateStart
- dateEnd
- clicks
- impressions
- ctr
- avgPosition
- createdAt

### GscQueryPageSnapshot

Stores query plus page pairings.

Fields:

- id
- websiteId
- query
- pageId optional
- url
- dateStart
- dateEnd
- clicks
- impressions
- ctr
- avgPosition
- createdAt

## GA4 snapshots

### Ga4LandingPageSnapshot

Fields:

- id
- websiteId
- pageId optional
- path
- url optional
- dateStart
- dateEnd
- sessions
- users
- engagedSessions
- engagementRate
- averageEngagementTime
- conversions
- revenue optional
- createdAt

## Rank tracking snapshots

### RankSnapshot

Fields:

- id
- websiteId
- keywordId optional
- keyword
- location
- device
- searchEngine
- rankPosition nullable
- rankingUrl nullable
- checkedAt
- createdAt

## Ahrefs snapshots

### BacklinkSnapshot

Fields:

- id
- websiteId
- referringDomain
- sourceUrl
- targetUrl
- anchorText
- domainRating optional
- firstSeen optional
- lastSeen optional
- status enum: LIVE, LOST, UNKNOWN
- createdAt

### AhrefsKeywordSnapshot

Fields:

- id
- websiteId
- keyword
- volume optional
- difficulty optional
- position optional
- url optional
- traffic optional
- dateCaptured
- createdAt

## Recommendation system

### Recommendation

Fields:

- id
- websiteId
- clientId
- pageId optional
- type enum:
  - TITLE_TAG_OPPORTUNITY
  - META_DESCRIPTION_OPPORTUNITY
  - H1_OPPORTUNITY
  - CONTENT_REFRESH
  - NEW_CONTENT_OPPORTUNITY
  - INTERNAL_LINK_OPPORTUNITY
  - TECHNICAL_ISSUE
  - INDEXING_ISSUE
  - SCHEMA_OPPORTUNITY
  - IMAGE_ALT_OPPORTUNITY
  - KEYWORD_CANNIBALIZATION
  - CTR_OPPORTUNITY
  - RANKING_DROP
  - COMPETITOR_GAP
  - OTHER
- title
- description
- currentValue optional
- suggestedValue optional
- reason
- supportingData JSON
- sourceAgents JSON
- priority enum: LOW, MEDIUM, HIGH, URGENT
- impact enum: LOW, MEDIUM, HIGH
- effort enum: LOW, MEDIUM, HIGH
- risk enum: LOW, MEDIUM, HIGH
- confidenceScore float
- status enum: DETECTED, NEEDS_REVIEW, APPROVED, REJECTED, CONVERTED_TO_TASK, COMPLETED, SKIPPED
- createdAt
- updatedAt

### Task

Fields:

- id
- websiteId
- clientId
- recommendationId optional
- pageId optional
- title
- description
- humanInstructions
- url optional
- beforeValue optional
- afterValue optional
- suggestedCopy optional
- priority enum: LOW, MEDIUM, HIGH, URGENT
- status enum: TODO, NEEDS_REVIEW, APPROVED, IN_PROGRESS, COMPLETED, SKIPPED, BLOCKED
- assigneeId optional
- dueDate optional
- completedAt optional
- completionNotes optional
- createdAt
- updatedAt

### ChangeLog

Fields:

- id
- websiteId
- clientId
- taskId optional
- recommendationId optional
- pageId optional
- url
- changeType
- fieldChanged
- oldValue optional
- newValue optional
- reason optional
- changedByUserId optional
- changedAt
- measureAfterDate optional
- createdAt

## Agent system

### AgentRun

Fields:

- id
- websiteId
- agentType enum:
  - DATA_INGESTION
  - TECHNICAL_SEO
  - SEARCH_PERFORMANCE
  - CONTENT_OPPORTUNITY
  - ON_PAGE_SEO
  - COMPETITOR_ANALYSIS
  - PRIORITIZATION
  - QA
  - REPORTING
- status enum: PENDING, RUNNING, SUCCESS, FAILED
- inputSummary JSON
- rawOutput text optional
- parsedOutput JSON optional
- errorMessage optional
- startedAt
- finishedAt
- createdAt

## Reporting

### MonthlyReport

Fields:

- id
- websiteId
- clientId
- month
- year
- dateStart
- dateEnd
- summary
- wins JSON
- losses JSON
- completedTasks JSON
- openTasks JSON
- recommendations JSON
- nextMonthPriorities JSON
- generatedAt
- createdAt
- updatedAt

## Important implementation notes

1. Store historical snapshots. Do not overwrite old performance data.
2. Use `websiteId` on almost every SEO object.
3. Use JSON fields for flexible supporting data, but keep core fields queryable.
4. Validate AI-generated recommendations before saving.
5. Keep raw agent output for debugging.
6. Make all recommendation/task statuses explicit.
7. Build indexes on websiteId, pageId, date ranges, and status fields.

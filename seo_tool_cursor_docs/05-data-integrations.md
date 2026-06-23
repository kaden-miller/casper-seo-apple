# 05 — Data Integrations

## Integration philosophy

The tool should treat external APIs as data sources, not as the app’s source of truth.

The app should import, normalize, and store snapshots so analysis can happen historically.

## Required MVP integrations

### Google Search Console

Purpose:

- Query data
- Page data
- Query/page pair data
- Clicks
- Impressions
- CTR
- Average position
- Indexing insights later

MVP import dimensions:

1. Page
2. Query
3. Query + Page

Recommended date ranges:

- Last 28 days
- Previous 28 days
- Current month
- Previous month

Store imported data in:

- GscPageSnapshot
- GscQuerySnapshot
- GscQueryPageSnapshot

Use cases:

- Find high impression / low CTR queries
- Find pages losing clicks
- Find pages gaining impressions
- Find ranking opportunities
- Find query/page mismatches

### Google Analytics 4

Purpose:

- Landing page sessions
- Users
- Engagement rate
- Average engagement time
- Conversions
- Organic traffic performance

MVP import dimensions:

- Landing page path
- Session default channel group if needed
- Date range

Store imported data in:

- Ga4LandingPageSnapshot

Use cases:

- See which organic landing pages drive engagement
- Compare conversion impact
- Identify pages with traffic but poor engagement

### Website crawler

Purpose:

Extract actual on-site SEO elements.

MVP crawl fields:

- URL
- Status code
- Final URL
- Title tag
- Meta description
- H1
- H2s
- Canonical URL
- Robots meta
- Word count
- Internal links
- External links
- Images
- Image alt text status
- Schema types

Store imported data in:

- CrawlRun
- Page
- PageSnapshot
- InternalLink

Crawler constraints:

- Respect robots.txt if enabled by setting.
- Limit pages per crawl in MVP.
- Avoid crawling external domains.
- Normalize URLs.
- Avoid infinite URL traps.
- Store crawl errors.

## Version 2 integrations

### Ahrefs

Purpose:

- Backlinks
- Referring domains
- Keyword data
- Competitor data
- Rank tracker data if available
- Content gap data if available

Potential imported data:

- Referring domains
- Backlinks
- Organic keywords
- Ranking positions
- Competitor keywords

Store imported data in:

- BacklinkSnapshot
- AhrefsKeywordSnapshot

Use cases:

- Backlink gap analysis
- Lost backlink alerts
- Competitor content opportunities
- Keyword opportunities

### Rank tracking API

Potential providers:

- SerpApi
- DataForSEO
- Zenserp
- Scale SERP
- Ahrefs Rank Tracker if available

Purpose:

Independent ranking checks for target keywords.

Needed parameters:

- Keyword
- Location
- Device
- Search engine
- Language

Store imported data in:

- RankSnapshot

Use cases:

- Monthly keyword movement
- Local rankings
- Mobile/desktop differences
- Which URL is ranking

### WordPress read-only integration

Version 2 or 3.

Purpose:

- Pull page/post data
- Pull Yoast/RankMath metadata if possible
- Identify editable post IDs
- Prepare update drafts later

MVP should not write to WordPress.

## Data normalization requirements

URLs should be normalized consistently.

Normalize:

- Remove trailing slash differences when matching
- Lowercase hostname
- Remove fragments
- Handle http/https
- Handle www/non-www based on canonical site setting
- Store original and normalized URL

## Data freshness requirements

Every integration should show:

- Last successful sync
- Last failed sync
- Current connection status
- Records imported
- Date range imported

## API failure handling

If an API fails:

1. Store the error.
2. Display it in the UI.
3. Do not silently skip it.
4. Allow manual retry.
5. Warn if recommendations are based on stale data.

## Sync scheduling

Recommended MVP schedules:

- GSC: daily or manual
- GA4: daily or manual
- Crawler: monthly and manual
- Recommendations: after data sync/crawl
- Reports: monthly and manual

## Important design rule

Never require all integrations to exist before a client can be used.

The system should work progressively:

- Crawl only = technical recommendations
- GSC only = search performance recommendations
- GA4 only = engagement/conversion insights
- GSC + crawl = strong on-page recommendations
- GSC + GA4 + crawl = better prioritization
- Add Ahrefs/rank tracking later = stronger competitive insights

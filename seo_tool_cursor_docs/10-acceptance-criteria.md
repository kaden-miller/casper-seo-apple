# 10 — Acceptance Criteria

Use this file to verify the product is being built correctly.

## Product-level acceptance criteria

The product is acceptable when it can do the following:

1. Manage multiple clients.
2. Manage multiple websites per client.
3. Store business context for each website.
4. Import or store SEO data by date range.
5. Crawl websites and store page snapshots.
6. Compare current and previous performance periods.
7. Generate structured SEO recommendations.
8. Let a human approve/reject recommendations.
9. Convert recommendations into tasks.
10. Track completed tasks and changes.
11. Generate a monthly SEO report.
12. Preserve historical data.

## Data acceptance criteria

### Historical snapshots

The app must store historical snapshots instead of overwriting data.

Pass condition:

- GSC imports for different date ranges create separate records.
- Page crawl snapshots are preserved over time.
- GA4 landing page snapshots are preserved over time.

### URL matching

The app must normalize URLs so pages from crawls, GSC, and GA4 can be associated.

Pass condition:

- `/service-page`, `https://example.com/service-page`, and `https://example.com/service-page/` can be matched correctly where appropriate.

### Data freshness

The app must show when data was last synced.

Pass condition:

- Website dashboard shows last GSC sync, last GA4 sync, and last crawl.
- Failed syncs are visible.

## Crawler acceptance criteria

The crawler is acceptable when it:

1. Starts from a website URL.
2. Crawls only the same domain.
3. Has a configurable page limit.
4. Extracts title tags.
5. Extracts meta descriptions.
6. Extracts H1 and H2s.
7. Extracts canonical URL.
8. Extracts robots meta.
9. Counts words.
10. Counts internal links.
11. Counts external links.
12. Counts images.
13. Counts images missing alt text.
14. Extracts schema types if present.
15. Stores crawl errors.
16. Displays crawl results in the UI.

## Google Search Console acceptance criteria

The GSC integration is acceptable when it:

1. Connects to a GSC property.
2. Imports page-level data.
3. Imports query-level data.
4. Imports query/page-level data.
5. Stores clicks, impressions, CTR, and average position.
6. Stores date range for every imported record.
7. Shows import status.
8. Shows import errors.
9. Allows manual re-sync.

## GA4 acceptance criteria

The GA4 integration is acceptable when it:

1. Connects to a GA4 property.
2. Imports landing page data.
3. Stores sessions, users, engagement, and conversions where available.
4. Stores date range for every imported record.
5. Shows import status.
6. Shows import errors.
7. Allows manual re-sync.

## Recommendation acceptance criteria

Recommendations are acceptable only if they include:

1. Type
2. Title
3. Description
4. URL/page if applicable
5. Current value if applicable
6. Suggested value if applicable
7. Reason
8. Supporting data
9. Priority
10. Impact
11. Effort
12. Risk
13. Confidence score
14. Status

A recommendation is not acceptable if it says only:

```txt
Improve SEO on this page.
```

## AI agent acceptance criteria

Agents are acceptable when:

1. Each agent has a narrow role.
2. Inputs are structured.
3. Outputs are JSON.
4. Outputs are validated.
5. Raw outputs are stored.
6. Invalid outputs do not create recommendations.
7. Recommendations cite supporting data.
8. Agents do not invent metrics.

## Task workflow acceptance criteria

The task system is acceptable when:

1. A recommendation can be converted into a task.
2. A task can be assigned a status.
3. A task can be completed.
4. Completing a task creates a change log.
5. Before and after values can be stored.
6. Completion notes can be stored.

## Change log acceptance criteria

Change logs are acceptable when they store:

1. Client
2. Website
3. Page URL
4. Task/recommendation reference if applicable
5. Field changed
6. Old value
7. New value
8. Reason
9. Date changed
10. User who changed it if available

## Report acceptance criteria

Monthly reports are acceptable when they include:

1. Executive summary
2. Organic performance overview
3. GSC summary
4. GA4 summary
5. Top winning pages
6. Top declining pages
7. Top query wins
8. Top query declines
9. Technical issues
10. Completed tasks
11. Open tasks
12. Recommendations for next month
13. Items to monitor

## UI acceptance criteria

The UI is acceptable when:

1. User can easily switch clients/websites.
2. Website dashboard shows key metrics and data freshness.
3. Recommendations are easy to review.
4. Tasks are easy to complete.
5. Supporting data is visible.
6. The user can tell what to do first.

## MVP done definition

MVP is done when a user can:

1. Create a client.
2. Add a website.
3. Run a crawl.
4. Import GSC data.
5. Import GA4 data.
6. See page inventory.
7. See search performance data.
8. Generate recommendations.
9. Approve recommendations.
10. Convert recommendations into tasks.
11. Complete tasks.
12. Record changes.
13. Generate a monthly report.

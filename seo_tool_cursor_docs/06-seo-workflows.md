# 06 — SEO Workflows

## Core monthly workflow

The system should support this monthly SEO process:

```txt
1. Select client website
2. Run data sync
3. Run website crawl
4. Generate analysis
5. Run agents
6. Review recommendations
7. Approve/reject recommendations
8. Convert approved recommendations into tasks
9. Complete tasks manually on website
10. Record changes
11. Generate monthly report
12. Measure impact next month
```

## Workflow 1: New client setup

Steps:

1. Create client.
2. Add website.
3. Add business description.
4. Add industry.
5. Add target services.
6. Add service areas.
7. Add important pages.
8. Add target keywords.
9. Add competitors.
10. Connect integrations.
11. Run first crawl.
12. Import initial GSC and GA4 data.
13. Generate baseline report.

## Workflow 2: Monthly SEO run

Steps:

1. User clicks “Run Monthly SEO Review.”
2. App checks data freshness.
3. App pulls latest GSC data.
4. App pulls latest GA4 data.
5. App runs or verifies latest crawl.
6. App calculates period-over-period changes.
7. App creates agent input packets.
8. Agents generate recommendations.
9. QA agent reviews recommendations.
10. Prioritization agent scores recommendations.
11. User sees monthly task list.

## Workflow 3: Recommendation review

User should be able to:

- View recommendation
- View supporting data
- View affected URL
- See suggested copy if applicable
- Approve
- Reject
- Edit suggested copy
- Convert to task
- Mark as duplicate
- Defer to later

Recommendation statuses:

```txt
DETECTED
NEEDS_REVIEW
APPROVED
REJECTED
CONVERTED_TO_TASK
COMPLETED
SKIPPED
```

## Workflow 4: Human task completion

Task statuses:

```txt
TODO
NEEDS_REVIEW
APPROVED
IN_PROGRESS
COMPLETED
SKIPPED
BLOCKED
```

When completing a task, user should enter:

- What changed
- Old value if applicable
- New value if applicable
- Completion notes
- Date completed

The app should create a ChangeLog record.

## Workflow 5: Impact review

The app should compare performance after changes.

For each completed task, the app should be able to show:

- Page URL
- Date changed
- Metric before change
- Metric after change
- Clicks before/after
- Impressions before/after
- CTR before/after
- Average position before/after
- GA4 sessions before/after
- Conversions before/after if available

Do not claim causation too strongly.

Preferred phrasing:

```txt
After this change, the page saw clicks increase from 42 to 61 in the next comparable period.
```

Avoid:

```txt
This title tag change caused a 45% traffic increase.
```

## Workflow 6: Monthly report generation

Report sections:

1. Executive summary
2. Organic performance overview
3. GSC performance
4. GA4 performance
5. Top page wins
6. Top page declines
7. Top keyword/query wins
8. Top keyword/query declines
9. Technical SEO issues
10. Completed work
11. Recommendations for next month
12. Items to monitor

## Workflow 7: Page-level optimization

User opens a page record.

The page view should show:

- Current title
- Current meta description
- Current H1
- H2s
- Word count
- GSC queries
- GA4 landing page data
- Ranking data if available
- Recommendations for that page
- Completed tasks for that page
- Change history for that page

Useful actions:

- Generate on-page recommendations
- Create title/meta task
- Create content refresh task
- Create internal linking task
- Mark page as priority

## Workflow 8: Content opportunity workflow

The system should find:

- Queries with impressions but no dedicated page
- Service areas without location pages
- Services without dedicated pages
- Blog topics that support service pages
- Pages with multiple unrelated query intents
- Pages ranking 16–30 that may need expansion

Each content opportunity should become either:

- Refresh existing page
- Create new service page
- Create new location page
- Create blog/supporting content
- Merge with existing page
- Add section to existing page

## Workflow 9: Technical SEO workflow

The technical SEO agent should group issues by type:

- Critical crawl/indexing issues
- Metadata issues
- Heading issues
- Internal linking issues
- Content depth issues
- Image issues
- Schema issues

For each issue, include:

- Affected URL
- Issue
- Why it matters
- Suggested fix
- Priority
- Effort
- Risk

## Workflow 10: Prioritization workflow

The prioritization agent should turn many recommendations into a realistic monthly plan.

For example, if 80 issues are found, the user should not receive 80 equal tasks.

Group into:

1. Do this month
2. Do next month
3. Monitor
4. Low priority backlog
5. Needs client input

## Important UX rule

The dashboard should avoid overwhelming the user.

The main monthly SEO screen should answer:

```txt
What should I do first?
Why?
Where?
What exactly should I change?
```

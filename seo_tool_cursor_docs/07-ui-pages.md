# 07 — UI Pages

## UI goal

The UI should feel like an SEO operations dashboard, not an analytics dumping ground.

The user should quickly understand:

1. Which client they are working on.
2. What data is fresh or stale.
3. What needs attention.
4. What tasks are highest priority.
5. What work has been completed.
6. What changed in performance.

## Main navigation

Suggested nav:

```txt
Dashboard
Clients
Websites
Monthly Reviews
Recommendations
Tasks
Pages
Keywords
Competitors
Reports
Settings
```

## Page 1: Global dashboard

Purpose:

Overview across all clients.

Show:

- Active clients
- Websites needing data sync
- Open high-priority tasks
- Recent recommendations
- Reports due this month
- Failed integrations
- Recent completed tasks

## Page 2: Client list

Show:

- Client name
- Website URL
- Last sync
- Open tasks
- High-priority recommendations
- Last monthly report

Actions:

- Add client
- Open client
- Archive client

## Page 3: Client detail

Show:

- Client info
- Websites
- Business notes
- Target services
- Service areas
- Competitors
- Recent reports
- Open tasks

Actions:

- Edit client
- Add website
- Add competitor
- Add keyword

## Page 4: Website dashboard

This is the most important page.

Show:

- Website URL
- Integration status
- Last GSC sync
- Last GA4 sync
- Last crawl
- Organic performance summary
- Top opportunities
- Open high-priority tasks
- Recent changes
- Button: Run Monthly SEO Review

Cards:

```txt
Organic Clicks
Organic Impressions
Average CTR
Average Position
Organic Sessions
Conversions
Pages Crawled
Open Tasks
```

## Page 5: Monthly review

Purpose:

Run and review monthly SEO process.

Sections:

1. Data freshness
2. Performance summary
3. Agent run status
4. Recommendations generated
5. Prioritized task list
6. Report generation

Actions:

- Sync data
- Run crawl
- Run agents
- Generate report

## Page 6: Recommendations

Show table with:

- Priority
- Type
- URL
- Title
- Impact
- Effort
- Risk
- Confidence
- Status
- Created date

Filters:

- Client
- Website
- Type
- Priority
- Status
- Agent

Recommendation detail should show:

- Recommendation title
- Description
- URL
- Current value
- Suggested value
- Reason
- Supporting data
- Agent that created it
- QA notes
- Buttons: Approve, Reject, Edit, Convert to Task

## Page 7: Tasks

Kanban or table view.

Statuses:

- Todo
- Needs Review
- Approved
- In Progress
- Completed
- Skipped
- Blocked

Task detail should show:

- Task title
- Description
- Human instructions
- Page URL
- Suggested copy
- Related recommendation
- Before value
- After value
- Completion notes
- Change log creation form

## Page 8: Page inventory

Show table with:

- URL
- Page type
- Status code
- Title
- H1
- Word count
- Organic clicks
- Organic impressions
- CTR
- Average position
- Open recommendations
- Last crawled

Filters:

- Page type
- Status code
- Missing title
- Missing meta
- Thin content
- Has recommendations
- Last crawled

## Page 9: Page detail

Show:

- URL
- Current crawl data
- GSC queries for page
- GA4 landing page data
- Recommendations for page
- Tasks for page
- Change history

Tabs:

```txt
Overview
Search Console
Analytics
Crawl Data
Recommendations
Tasks
Change Log
```

## Page 10: Keywords

Show:

- Keyword
- Target URL
- Priority
- Location
- Device
- Current rank if available
- Previous rank
- Ranking URL
- Notes

Actions:

- Add keyword
- Import keywords
- Run rank check, later

## Page 11: Competitors

Show:

- Competitor name
- Domain
- Notes
- Shared keywords if available
- Backlink gap if available

Actions:

- Add competitor
- Run competitor analysis, later

## Page 12: Reports

Show:

- Month
- Client
- Website
- Generated date
- Summary
- Status

Report detail should show:

- Executive summary
- Performance overview
- Completed tasks
- Recommendations
- Next month priorities

## Page 13: Integrations/settings

Show:

- GSC connection
- GA4 connection
- Ahrefs connection, later
- Rank tracker connection, later
- WordPress connection, later
- API status
- Last sync
- Sync history

Actions:

- Connect
- Disconnect
- Test connection
- Run sync

## UI quality rules

1. Do not hide supporting data behind AI prose.
2. Show metrics beside recommendations.
3. Make statuses obvious.
4. Prioritize the next action.
5. Avoid massive walls of text.
6. Use detail pages for depth.
7. Use tables for operational work.
8. Use cards for dashboard summaries.
9. Use badges for priority/status.
10. Show last-updated timestamps everywhere data freshness matters.

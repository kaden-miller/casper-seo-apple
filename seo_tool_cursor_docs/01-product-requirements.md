# 01 — Product Requirements

## Product name

Working name: **SEO Ops Console**

## Product purpose

Build a multi-client SEO operations dashboard that supports monthly SEO work by collecting data, analyzing performance, recommending changes, creating human-reviewable tasks, and measuring impact over time.

This tool is designed for an SEO/web agency workflow where AI recommends improvements but a human reviews and performs the actual website updates.

## Primary user

A web developer, SEO consultant, or agency operator managing monthly SEO tasks for multiple client websites.

## Main goal

Help the user answer these questions every month:

1. What changed in organic performance?
2. What pages are improving or declining?
3. What keywords are gaining or losing visibility?
4. What technical SEO problems need attention?
5. What on-page updates should be made?
6. What content should be refreshed, expanded, merged, or created?
7. Which tasks matter most this month?
8. What work was completed?
9. Did last month’s changes help?

## Core product concept

The product should operate like a monthly SEO command center.

Flow:

```txt
Client setup
  -> Data sync
  -> Website crawl
  -> Performance analysis
  -> Agent recommendations
  -> Human review
  -> Task completion
  -> Change log
  -> Impact review
  -> Monthly report
```

## MVP scope

Version 1 should include:

1. Multi-client support
2. Website/project setup
3. Google Search Console data import
4. Google Analytics 4 data import
5. Basic website crawler
6. Page inventory
7. Query/page performance snapshots
8. Structured recommendation generation
9. Human task board
10. Change log
11. Monthly report generation
12. Agent run history

## Non-MVP scope

Do not build these in Version 1 unless the foundation is complete:

1. Automatic WordPress updates
2. Automatic publishing
3. Client-facing approval portals
4. Full Ahrefs integration
5. Full backlink analysis
6. Local SEO review monitoring
7. White-label PDF exports
8. Advanced competitor content scraping
9. Direct CMS write access

## Human-in-the-middle requirement

The system must not automatically modify client websites in the MVP.

AI agents may recommend:

- Title tag updates
- Meta description updates
- H1 updates
- Content refreshes
- Internal links
- Schema improvements
- Technical fixes
- New content ideas

But a human must review and mark recommendations as:

- Approved
- Rejected
- Needs edits
- In progress
- Completed
- Skipped

## Recommendation requirements

Each recommendation must include:

- Client
- Website
- URL/page if applicable
- Recommendation type
- Current value if available
- Suggested value if applicable
- Reason
- Supporting data sources
- Priority
- Impact estimate
- Effort estimate
- Risk estimate
- Confidence score
- Status
- Assigned user if applicable
- Created date
- Completed date if applicable

## Task requirements

Recommendations should be convertible into tasks.

Each task must include:

- Title
- Description
- Related recommendation
- Page URL
- Human instructions
- Suggested copy when relevant
- Priority
- Status
- Assignee
- Due date optional
- Completion notes
- Before value
- After value

## Reporting requirements

Monthly reports should include:

1. Organic traffic summary
2. Search Console summary
3. Top winning pages
4. Top declining pages
5. Top winning queries
6. Top declining queries
7. Technical issues found
8. Recommendations created
9. Tasks completed
10. Tasks still open
11. Changes made this month
12. Items to review next month

## Product constraints

1. API data may be incomplete or unavailable.
2. The system must show data freshness and import status.
3. The system must not invent SEO data.
4. AI recommendations must reference the data that triggered them.
5. Historical snapshots are required. Do not only store current values.
6. AI output must be parseable and stored in the database.
7. The UI should make it clear when a recommendation came from AI.

## Success criteria

The tool is successful when a user can open a client project and quickly see:

1. What needs to be done this month.
2. Why each task matters.
3. What specific change should be made.
4. Which tasks are highest priority.
5. What was completed last month.
6. Whether past updates helped.

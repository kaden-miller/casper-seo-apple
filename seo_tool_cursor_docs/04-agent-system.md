# 04 — Agent System

## Agent design principle

Each agent should have a narrow responsibility. Agents should not all do everything.

The system should use specialized agents that produce structured outputs. The goal is separation of duties, traceability, and better recommendation quality.

## Agent runner requirements

Create a reusable agent runner that:

1. Accepts an agent type.
2. Builds a structured input packet.
3. Sends that packet to an LLM with a specific prompt.
4. Requires JSON output.
5. Validates output with Zod.
6. Stores the raw output.
7. Stores the parsed output.
8. Creates recommendations only after validation.

## Required agents

### 1. Data Ingestion Agent

Purpose:

Verifies whether the required data exists and is fresh enough to analyze.

This agent should not make SEO recommendations.

Inputs:

- Integration run statuses
- Last sync dates
- Date ranges available
- Data source errors

Outputs:

- Data freshness summary
- Missing data warnings
- Failed integration warnings
- Recommended re-sync actions

Example output:

```json
{
  "summary": "GSC and GA4 data are current. Crawl data is stale.",
  "warnings": [
    {
      "source": "crawler",
      "message": "Website has not been crawled in 42 days.",
      "severity": "medium"
    }
  ]
}
```

### 2. Technical SEO Agent

Purpose:

Finds technical SEO issues from crawl data.

Inputs:

- Crawl run data
- Page snapshots
- Internal links
- Indexability signals

Checks:

- Broken pages
- Redirected pages
- Missing title tags
- Duplicate title tags
- Missing meta descriptions
- Duplicate meta descriptions
- Missing H1s
- Multiple H1s
- Canonical problems
- Noindex problems
- Robots meta issues
- Thin pages
- Images missing alt text
- Internal link problems
- Schema opportunities

Output:

Structured recommendations.

Example recommendation:

```json
{
  "type": "TECHNICAL_ISSUE",
  "title": "Fix missing meta description on service page",
  "url": "https://example.com/lawn-care",
  "description": "The page is missing a meta description.",
  "reason": "Missing meta descriptions reduce control over search result snippets.",
  "priority": "MEDIUM",
  "impact": "LOW",
  "effort": "LOW",
  "risk": "LOW",
  "confidenceScore": 0.95
}
```

### 3. Search Performance Agent

Purpose:

Analyzes GSC and GA4 data to find performance opportunities.

Inputs:

- Current period GSC data
- Previous period GSC data
- Current period GA4 landing page data
- Previous period GA4 landing page data
- Page inventory

Checks:

- Pages losing clicks
- Pages gaining impressions but not clicks
- High-impression low-CTR queries
- Queries ranking positions 4–15
- Queries ranking positions 16–30
- Pages with ranking declines
- Pages with traffic declines
- Pages with low engagement or conversions
- Query/page mismatches
- Potential keyword cannibalization

Output:

Structured recommendations.

### 4. Content Opportunity Agent

Purpose:

Finds content updates and new content opportunities.

Inputs:

- Page inventory
- GSC query data
- Keyword list
- Competitor data if available
- Service areas
- Target services

Checks:

- Missing service pages
- Missing location pages
- Pages needing expansion
- Outdated pages
- Blog opportunities
- FAQ/content section opportunities
- Weak topical coverage
- Search intent mismatch
- Pages that should be merged

Output:

Structured recommendations.

### 5. On-Page SEO Agent

Purpose:

Creates practical, human-implementable on-page suggestions.

Inputs:

- Page snapshot
- Target keyword
- GSC queries for page
- Current title
- Current meta description
- Current H1
- Headings
- Word count
- Business context

Outputs:

- Suggested title tag
- Suggested meta description
- Suggested H1
- Suggested heading improvements
- Suggested internal links
- Suggested alt text improvements
- Suggested schema additions

Rules:

- Title tags should usually be under 60 characters when possible.
- Meta descriptions should usually be under 155–160 characters when possible.
- Suggestions must match the search intent.
- Do not keyword-stuff.
- Do not invent services the client does not offer.
- Do not suggest changes without a reason.

### 6. Competitor Analysis Agent

Purpose:

Compares the client to competitors.

Inputs:

- Competitor list
- Ranking data
- Ahrefs data if available
- SERP data if available
- Page inventory

Checks:

- Competitors outranking client
- Competitor pages ranking for target keywords
- Missing client content
- Backlink gaps
- Content format gaps
- Local competitor visibility

Output:

Structured recommendations.

### 7. Prioritization Agent

Purpose:

Scores and organizes recommendations into a monthly task list.

Inputs:

- All detected recommendations
- Client business priorities
- Page importance
- Impact/effort/risk values
- Confidence scores

Scoring formula:

```txt
Priority Score = Impact + Confidence + Business Value - Effort - Risk
```

Use numeric internal scoring:

```txt
Impact: LOW=1, MEDIUM=2, HIGH=3
Effort: LOW=1, MEDIUM=2, HIGH=3
Risk: LOW=0, MEDIUM=1, HIGH=2
Confidence: 0 to 3
Business Value: 1 to 3
```

Output:

- Sorted recommendation list
- Monthly recommended tasks
- Deferred tasks
- Duplicate recommendations to merge

### 8. QA Agent

Purpose:

Reviews agent-generated recommendations before they are shown to the user.

Inputs:

- Recommendations
- Supporting data
- Page data
- Business context

Checks:

- Is the recommendation supported by data?
- Is it duplicative?
- Is the suggested copy too long?
- Does the copy match the page intent?
- Does it overpromise?
- Does it conflict with another recommendation?
- Does it recommend work outside the client’s business?

Output:

- Approved recommendations
- Rejected recommendations
- Recommendations needing edits
- QA notes

### 9. Reporting Agent

Purpose:

Creates monthly reports from structured data.

Inputs:

- Performance snapshots
- Completed tasks
- Open tasks
- Change logs
- Recommendations

Output:

- Executive summary
- Organic performance summary
- Wins
- Losses
- Completed work
- Recommended next steps
- Items to monitor

## Recommended JSON schema for recommendations

```json
{
  "recommendations": [
    {
      "type": "TITLE_TAG_OPPORTUNITY",
      "title": "Improve title tag for lawn care service page",
      "url": "https://example.com/lawn-care",
      "description": "Rewrite the title tag to better target the main query and improve CTR.",
      "currentValue": "Lawn Care | Company Name",
      "suggestedValue": "Lawn Care in Wichita, KS | Company Name",
      "reason": "The page receives impressions for 'lawn care wichita ks' but has a below-average CTR.",
      "supportingData": {
        "query": "lawn care wichita ks",
        "impressions": 1200,
        "clicks": 18,
        "ctr": 0.015,
        "avgPosition": 7.2
      },
      "priority": "HIGH",
      "impact": "MEDIUM",
      "effort": "LOW",
      "risk": "LOW",
      "confidenceScore": 0.86
    }
  ]
}
```

## Agent prompt rules

Every agent prompt should include:

1. Role and responsibility
2. Input data explanation
3. Output schema
4. Hard constraints
5. Reminder not to invent unsupported data
6. SEO quality guidelines

## Anti-patterns to avoid

Do not allow agents to:

1. Create vague recommendations like “improve SEO.”
2. Recommend unsupported changes.
3. Invent traffic, rankings, or conversions.
4. Combine too many responsibilities into one agent.
5. Output only prose.
6. Skip confidence scores.
7. Skip supporting data.
8. Automatically publish website changes.

import { ANALYSIS_THRESHOLDS } from "./constants";
import type { AnalysisFinding, CrawlPageRow, WebsiteAnalysisContext } from "./types";

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

function normalizeDuplicateValue(value: string | null | undefined): string | null {
  if (isBlank(value)) {
    return null;
  }

  return value!.trim().toLowerCase();
}

export function findMissingTitles(pages: CrawlPageRow[]): AnalysisFinding[] {
  return pages
    .filter((page) => isBlank(page.title))
    .map((page) => ({
      type: "missing_title" as const,
      category: "technical_seo" as const,
      severity: "high" as const,
      title: page.url,
      description: "Page is missing a title tag in the latest crawl.",
      pageId: page.pageId,
      url: page.url,
      metrics: {},
    }));
}

export function findMissingMetaDescriptions(
  pages: CrawlPageRow[],
): AnalysisFinding[] {
  return pages
    .filter((page) => isBlank(page.metaDescription))
    .map((page) => ({
      type: "missing_meta_description" as const,
      category: "technical_seo" as const,
      severity: "medium" as const,
      title: page.url,
      description: "Page is missing a meta description in the latest crawl.",
      pageId: page.pageId,
      url: page.url,
      metrics: {},
    }));
}

export function findMissingH1s(pages: CrawlPageRow[]): AnalysisFinding[] {
  return pages
    .filter((page) => isBlank(page.h1))
    .map((page) => ({
      type: "missing_h1" as const,
      category: "technical_seo" as const,
      severity: "medium" as const,
      title: page.url,
      description: "Page is missing an H1 heading in the latest crawl.",
      pageId: page.pageId,
      url: page.url,
      metrics: {},
    }));
}

export function findThinPages(pages: CrawlPageRow[]): AnalysisFinding[] {
  const { thinPageWordCount } = ANALYSIS_THRESHOLDS;

  return pages
    .filter(
      (page) =>
        page.wordCount != null && page.wordCount < thinPageWordCount,
    )
    .sort((a, b) => (a.wordCount ?? 0) - (b.wordCount ?? 0))
    .map((page) => ({
      type: "thin_page" as const,
      category: "technical_seo" as const,
      severity: (page.wordCount ?? 0) < 150 ? "high" : "medium",
      title: page.url,
      description: `Page has only ${page.wordCount?.toLocaleString() ?? 0} words (threshold: ${thinPageWordCount}).`,
      pageId: page.pageId,
      url: page.url,
      metrics: {
        wordCount: page.wordCount ?? 0,
        threshold: thinPageWordCount,
      },
    }));
}

export function findImagesMissingAlt(pages: CrawlPageRow[]): AnalysisFinding[] {
  return pages
    .filter((page) => (page.imagesMissingAltCount ?? 0) > 0)
    .sort(
      (a, b) =>
        (b.imagesMissingAltCount ?? 0) - (a.imagesMissingAltCount ?? 0),
    )
    .map((page) => ({
      type: "images_missing_alt" as const,
      category: "technical_seo" as const,
      severity: (page.imagesMissingAltCount ?? 0) >= 5 ? "high" : "medium",
      title: page.url,
      description: `${page.imagesMissingAltCount} image(s) missing alt text out of ${page.imageCount ?? 0} total.`,
      pageId: page.pageId,
      url: page.url,
      metrics: {
        imagesMissingAlt: page.imagesMissingAltCount ?? 0,
        imageCount: page.imageCount ?? 0,
      },
    }));
}

function findDuplicateValues(
  pages: CrawlPageRow[],
  getValue: (page: CrawlPageRow) => string | null,
  type: "duplicate_title" | "duplicate_meta_description",
  label: string,
): AnalysisFinding[] {
  const groups = new Map<string, CrawlPageRow[]>();

  for (const page of pages) {
    const normalized = getValue(page);
    if (!normalized) {
      continue;
    }

    const existing = groups.get(normalized) ?? [];
    existing.push(page);
    groups.set(normalized, existing);
  }

  const findings: AnalysisFinding[] = [];

  for (const [value, groupedPages] of groups) {
    if (groupedPages.length < 2) {
      continue;
    }

    for (const page of groupedPages) {
      findings.push({
        type,
        category: "technical_seo",
        severity: groupedPages.length >= 3 ? "high" : "medium",
        title: page.url,
        description: `${label} "${value}" is used on ${groupedPages.length} pages.`,
        pageId: page.pageId,
        url: page.url,
        metrics: {
          duplicateValue: value,
          duplicateCount: groupedPages.length,
        },
      });
    }
  }

  return findings.sort(
    (a, b) => Number(b.metrics.duplicateCount) - Number(a.metrics.duplicateCount),
  );
}

export function findDuplicateTitles(pages: CrawlPageRow[]): AnalysisFinding[] {
  return findDuplicateValues(
    pages,
    (page) => normalizeDuplicateValue(page.title),
    "duplicate_title",
    "Title",
  );
}

export function findDuplicateMetaDescriptions(
  pages: CrawlPageRow[],
): AnalysisFinding[] {
  return findDuplicateValues(
    pages,
    (page) => normalizeDuplicateValue(page.metaDescription),
    "duplicate_meta_description",
    "Meta description",
  );
}

export function runCrawlAnalysis(
  context: WebsiteAnalysisContext,
): AnalysisFinding[] {
  const { crawlPages } = context;

  return [
    ...findMissingTitles(crawlPages),
    ...findMissingMetaDescriptions(crawlPages),
    ...findMissingH1s(crawlPages),
    ...findThinPages(crawlPages),
    ...findImagesMissingAlt(crawlPages),
    ...findDuplicateTitles(crawlPages),
    ...findDuplicateMetaDescriptions(crawlPages),
  ];
}

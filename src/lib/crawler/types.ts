export const CRAWL_REQUEST_TIMEOUT_MS = 12_000;
export const CRAWL_USER_AGENT =
  "SEO-Ops-Console-Crawler/1.0 (+https://github.com/seo-ops-console)";

/** Optional safety cap via CRAWL_MAX_PAGES env. Unset = crawl entire same-domain site. */
export function getCrawlMaxPages(): number | null {
  const raw = process.env.CRAWL_MAX_PAGES?.trim();
  if (!raw) {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export type CrawledLink = {
  href: string;
  anchorText: string;
  isInternal: boolean;
};

export type CrawledPageData = {
  requestedUrl: string;
  finalUrl: string;
  statusCode: number;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  h2s: string[];
  canonicalUrl: string | null;
  robotsMeta: string | null;
  wordCount: number;
  internalLinks: CrawledLink[];
  externalLinks: CrawledLink[];
  imageCount: number;
  imagesMissingAltCount: number;
  schemaTypes: string[];
  rawHtmlHash: string | null;
  error?: string;
};

export type CrawlPageError = {
  url: string;
  message: string;
};

export type CrawlResult = {
  startUrl: string;
  pages: CrawledPageData[];
  errors: CrawlPageError[];
  pagesFound: number;
  pagesCrawled: number;
};

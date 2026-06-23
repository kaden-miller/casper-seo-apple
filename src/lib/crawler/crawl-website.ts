import {
  CRAWL_REQUEST_TIMEOUT_MS,
  CRAWL_USER_AGENT,
  getCrawlMaxPages,
  type CrawlPageError,
  type CrawlResult,
  type CrawledPageData,
} from "@/lib/crawler/types";
import { extractPageData, getAllowedHost } from "@/lib/crawler/extract";
import {
  isCrawlableUrl,
  isSameHost,
  normalizeUrl,
} from "@/lib/crawler/url-utils";

async function fetchPage(url: string): Promise<{
  html: string;
  finalUrl: string;
  statusCode: number;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CRAWL_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": CRAWL_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error(`Unsupported content type: ${contentType || "unknown"}`);
    }

    const html = await response.text();
    return {
      html,
      finalUrl: response.url || url,
      statusCode: response.status,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function crawlWebsite(startUrl: string): Promise<CrawlResult> {
  const normalizedStart = normalizeUrl(startUrl);
  if (!normalizedStart) {
    throw new Error("Invalid website URL");
  }

  const maxPages = getCrawlMaxPages();
  const allowedHost = getAllowedHost(normalizedStart);
  const queue: string[] = [normalizedStart];
  const visited = new Set<string>();
  const queued = new Set<string>([normalizedStart]);
  const pages: CrawledPageData[] = [];
  const errors: CrawlPageError[] = [];

  while (queue.length > 0) {
    if (maxPages !== null && pages.length >= maxPages) {
      break;
    }

    const currentUrl = queue.shift()!;
    if (visited.has(currentUrl)) {
      continue;
    }

    visited.add(currentUrl);

    try {
      const { html, finalUrl, statusCode } = await fetchPage(currentUrl);
      const normalizedFinal = normalizeUrl(finalUrl) ?? finalUrl;

      if (!isSameHost(normalizedFinal, allowedHost)) {
        errors.push({
          url: currentUrl,
          message: "Redirected outside allowed domain",
        });
        continue;
      }

      const pageData = extractPageData(
        html,
        currentUrl,
        normalizedFinal,
        statusCode,
        allowedHost,
      );
      pages.push(pageData);

      for (const link of pageData.internalLinks) {
        const normalized = normalizeUrl(link.href);
        if (!normalized || visited.has(normalized) || queued.has(normalized)) {
          continue;
        }

        if (isSameHost(normalized, allowedHost) && isCrawlableUrl(normalized)) {
          queued.add(normalized);
          queue.push(normalized);
        }
      }
    } catch (error) {
      errors.push({
        url: currentUrl,
        message:
          error instanceof Error ? error.message : "Failed to fetch page",
      });
    }
  }

  return {
    startUrl: normalizedStart,
    pages,
    errors,
    pagesFound: visited.size + queue.length,
    pagesCrawled: pages.length,
  };
}

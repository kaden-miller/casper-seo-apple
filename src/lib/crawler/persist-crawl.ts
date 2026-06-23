import type { PageStatus } from "@/generated/prisma/client";
import { crawlWebsite } from "@/lib/crawler/crawl-website";
import { normalizeUrl } from "@/lib/crawler/url-utils";
import { prisma } from "@/lib/db";

function pageStatusFromCode(statusCode: number): PageStatus {
  if (statusCode === 404) {
    return "NOT_FOUND";
  }

  if (statusCode >= 300 && statusCode < 400) {
    return "REDIRECTED";
  }

  if (statusCode >= 200 && statusCode < 300) {
    return "ACTIVE";
  }

  return "ARCHIVED";
}

function formatCrawlErrors(
  errors: { url: string; message: string }[],
): string | null {
  if (errors.length === 0) {
    return null;
  }

  const preview = errors
    .slice(0, 5)
    .map((error) => `${error.url}: ${error.message}`)
    .join("\n");

  const suffix =
    errors.length > 5 ? `\n...and ${errors.length - 5} more errors` : "";

  return `${preview}${suffix}`;
}

export async function runCrawlForWebsite(websiteId: string, startUrl: string) {
  const startedAt = new Date();

  const crawlRun = await prisma.crawlRun.create({
    data: {
      websiteId,
      status: "RUNNING",
      startUrl,
      startedAt,
    },
  });

  try {
    const result = await crawlWebsite(startUrl);
    const urlToPageId = new Map<string, string>();
    const now = new Date();

    for (const page of result.pages) {
      const normalizedUrl =
        normalizeUrl(page.finalUrl) ?? normalizeUrl(page.requestedUrl);
      if (!normalizedUrl) {
        continue;
      }

      const existing = await prisma.page.findUnique({
        where: {
          websiteId_normalizedUrl: {
            websiteId,
            normalizedUrl,
          },
        },
      });

      const pageRecord = existing
        ? await prisma.page.update({
            where: { id: existing.id },
            data: {
              url: page.finalUrl,
              lastCrawledAt: now,
              status: pageStatusFromCode(page.statusCode),
            },
          })
        : await prisma.page.create({
            data: {
              websiteId,
              url: page.finalUrl,
              normalizedUrl,
              lastCrawledAt: now,
              status: pageStatusFromCode(page.statusCode),
            },
          });

      urlToPageId.set(normalizedUrl, pageRecord.id);

      await prisma.pageSnapshot.create({
        data: {
          pageId: pageRecord.id,
          websiteId,
          crawlRunId: crawlRun.id,
          statusCode: page.statusCode,
          finalUrl: page.finalUrl,
          title: page.title,
          metaDescription: page.metaDescription,
          h1: page.h1,
          h2s: page.h2s,
          canonicalUrl: page.canonicalUrl,
          robotsMeta: page.robotsMeta,
          wordCount: page.wordCount,
          internalLinkCount: page.internalLinks.length,
          externalLinkCount: page.externalLinks.length,
          imageCount: page.imageCount,
          imagesMissingAltCount: page.imagesMissingAltCount,
          schemaTypes: page.schemaTypes,
          rawHtmlHash: page.rawHtmlHash,
        },
      });
    }

    const internalLinkRows: {
      websiteId: string;
      fromPageId: string;
      toPageId: string | null;
      fromUrl: string;
      toUrl: string;
      anchorText: string | null;
    }[] = [];

    for (const page of result.pages) {
      const fromNormalized =
        normalizeUrl(page.finalUrl) ?? normalizeUrl(page.requestedUrl);
      if (!fromNormalized) {
        continue;
      }

      const fromPageId = urlToPageId.get(fromNormalized);
      if (!fromPageId) {
        continue;
      }

      for (const link of page.internalLinks) {
        const toNormalized = normalizeUrl(link.href);
        internalLinkRows.push({
          websiteId,
          fromPageId,
          toPageId: toNormalized ? urlToPageId.get(toNormalized) ?? null : null,
          fromUrl: page.finalUrl,
          toUrl: link.href,
          anchorText: link.anchorText || null,
        });
      }
    }

    if (internalLinkRows.length > 0) {
      await prisma.internalLink.deleteMany({ where: { websiteId } });
      await prisma.internalLink.createMany({ data: internalLinkRows });
    }

    const finishedAt = new Date();
    const errorMessage = formatCrawlErrors(result.errors);

    await prisma.crawlRun.update({
      where: { id: crawlRun.id },
      data: {
        status: result.pages.length > 0 ? "SUCCESS" : "FAILED",
        pagesFound: result.pagesFound,
        pagesCrawled: result.pagesCrawled,
        errorMessage,
        finishedAt,
      },
    });

    return {
      crawlRunId: crawlRun.id,
      pagesCrawled: result.pagesCrawled,
      pagesFound: result.pagesFound,
      errorCount: result.errors.length,
      errorMessage,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Crawl failed unexpectedly";

    await prisma.crawlRun.update({
      where: { id: crawlRun.id },
      data: {
        status: "FAILED",
        errorMessage: message,
        finishedAt: new Date(),
      },
    });

    throw error;
  }
}

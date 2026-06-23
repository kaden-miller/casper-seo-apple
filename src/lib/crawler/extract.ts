import { createHash } from "crypto";
import * as cheerio from "cheerio";
import type { CrawledLink, CrawledPageData } from "@/lib/crawler/types";
import {
  getHostname,
  isSameHost,
  normalizeUrl,
  resolveLink,
} from "@/lib/crawler/url-utils";

function collectSchemaTypes(value: unknown, types: Set<string>) {
  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectSchemaTypes(item, types));
    return;
  }

  if (typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;
  if (typeof record["@type"] === "string") {
    types.add(record["@type"]);
  } else if (Array.isArray(record["@type"])) {
    record["@type"].forEach((type) => {
      if (typeof type === "string") {
        types.add(type);
      }
    });
  }

  if (record["@graph"]) {
    collectSchemaTypes(record["@graph"], types);
  }
}

function extractSchemaTypes($: cheerio.CheerioAPI): string[] {
  const types = new Set<string>();

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).html()?.trim();
    if (!raw) {
      return;
    }

    try {
      collectSchemaTypes(JSON.parse(raw), types);
    } catch {
      // Ignore invalid JSON-LD blocks.
    }
  });

  return Array.from(types).sort();
}

function countWords($: cheerio.CheerioAPI): number {
  const clone = cheerio.load($.root().html() ?? "");
  clone("script, style, noscript").remove();
  const text = clone("body").text().replace(/\s+/g, " ").trim();
  if (!text) {
    return 0;
  }

  return text.split(" ").filter(Boolean).length;
}

function extractLinks(
  $: cheerio.CheerioAPI,
  pageUrl: string,
  allowedHost: string,
): { internal: CrawledLink[]; external: CrawledLink[] } {
  const internal: CrawledLink[] = [];
  const external: CrawledLink[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) {
      return;
    }

    const resolved = resolveLink(href, pageUrl);
    if (!resolved || seen.has(resolved)) {
      return;
    }

    seen.add(resolved);
    const anchorText = $(element).text().replace(/\s+/g, " ").trim();
    const link: CrawledLink = { href: resolved, anchorText, isInternal: false };

    if (isSameHost(resolved, allowedHost)) {
      link.isInternal = true;
      internal.push(link);
    } else {
      external.push(link);
    }
  });

  return { internal, external };
}

export function extractPageData(
  html: string,
  requestedUrl: string,
  finalUrl: string,
  statusCode: number,
  allowedHost: string,
): CrawledPageData {
  const $ = cheerio.load(html);
  const h2s = $("h2")
    .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean);

  const canonicalHref = $('link[rel="canonical"]').attr("href");
  const canonicalUrl = canonicalHref
    ? normalizeUrl(canonicalHref, finalUrl)
    : null;

  let imagesMissingAltCount = 0;
  const imageCount = $("img").length;
  $("img").each((_, element) => {
    const alt = $(element).attr("alt");
    if (!alt?.trim()) {
      imagesMissingAltCount += 1;
    }
  });

  const { internal, external } = extractLinks($, finalUrl, allowedHost);
  const hash = createHash("sha256").update(html).digest("hex");

  return {
    requestedUrl,
    finalUrl: normalizeUrl(finalUrl) ?? finalUrl,
    statusCode,
    title: $("title").first().text().replace(/\s+/g, " ").trim() || null,
    metaDescription:
      $('meta[name="description"]').attr("content")?.trim() || null,
    h1: $("h1").first().text().replace(/\s+/g, " ").trim() || null,
    h2s,
    canonicalUrl,
    robotsMeta: $('meta[name="robots"]').attr("content")?.trim() || null,
    wordCount: countWords($),
    internalLinks: internal,
    externalLinks: external,
    imageCount,
    imagesMissingAltCount,
    schemaTypes: extractSchemaTypes($),
    rawHtmlHash: hash,
  };
}

export function getAllowedHost(startUrl: string): string {
  const host = getHostname(startUrl);
  if (!host) {
    throw new Error("Invalid start URL");
  }

  return host;
}

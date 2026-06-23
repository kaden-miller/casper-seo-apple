const STRIP_HASH = /#.*$/;

export function normalizeUrl(input: string, baseUrl?: string): string | null {
  try {
    const url = new URL(input, baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    url.hash = "";
    url.hostname = url.hostname.toLowerCase();

    if (
      (url.protocol === "http:" && url.port === "80") ||
      (url.protocol === "https:" && url.port === "443")
    ) {
      url.port = "";
    }

    let pathname = url.pathname || "/";
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    url.pathname = pathname;

    return url.toString().replace(STRIP_HASH, "");
  } catch {
    return null;
  }
}

export function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isSameHost(url: string, allowedHost: string): boolean {
  const host = getHostname(url);
  return host === allowedHost.toLowerCase();
}

export function isCrawlableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }

    const path = parsed.pathname.toLowerCase();
    const blockedExtensions = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".zip",
      ".css",
      ".js",
      ".xml",
      ".json",
    ];

    return !blockedExtensions.some((ext) => path.endsWith(ext));
  } catch {
    return false;
  }
}

export function resolveLink(href: string, pageUrl: string): string | null {
  const trimmed = href.trim();
  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("javascript:")
  ) {
    return null;
  }

  return normalizeUrl(trimmed, pageUrl);
}

"use client";

import { useState, useTransition } from "react";
import { Loader2, Play } from "lucide-react";
import { runWebsiteCrawl } from "@/app/(dashboard)/websites/actions";
import { Button } from "@/components/ui/button";

type RunCrawlButtonProps = {
  websiteId: string;
};

export function RunCrawlButton({ websiteId }: RunCrawlButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleRun() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await runWebsiteCrawl(websiteId);

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      if ("success" in result && result.success) {
        setMessage(
          `Crawled ${result.pagesCrawled} pages` +
            (result.errorCount > 0
              ? ` (${result.errorCount} page errors)`
              : ""),
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={handleRun} disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Play className="size-4" />
        )}
        {isPending ? "Crawling..." : "Run crawl"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Crawls every discoverable page on the same domain. Large sites may take
        several minutes.
      </p>
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

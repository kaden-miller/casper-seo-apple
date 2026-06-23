"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  disconnectGsc,
  listGscSitesForWebsite,
  saveGscSiteUrl,
  syncGscData,
} from "@/app/(dashboard)/websites/gsc-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Integration, IntegrationRun } from "@/generated/prisma/client";

type GscIntegrationPanelProps = {
  websiteId: string;
  integration: Integration | null;
  runs: IntegrationRun[];
  oauthConfigured: boolean;
};

function statusVariant(status: Integration["status"] | IntegrationRun["status"]) {
  switch (status) {
    case "CONNECTED":
    case "SUCCESS":
      return "default" as const;
    case "RUNNING":
    case "PENDING":
      return "secondary" as const;
    case "ERROR":
    case "FAILED":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function GscIntegrationPanel({
  websiteId,
  integration,
  runs,
  oauthConfigured,
}: GscIntegrationPanelProps) {
  const [sites, setSites] = useState<string[]>([]);
  const [selectedSite, setSelectedSite] = useState(integration?.siteUrl ?? "");
  const [manualSite, setManualSite] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isConnected =
    integration?.status === "CONNECTED" || integration?.status === "ERROR";
  const hasTokens = Boolean(integration?.accessTokenEncrypted);

  useEffect(() => {
    if (!isConnected || !hasTokens) {
      return;
    }

    startTransition(async () => {
      const result = await listGscSitesForWebsite(websiteId);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSites(result.sites ?? []);
    });
  }, [websiteId, isConnected, hasTokens]);

  function handleSaveSite() {
    const siteUrl = selectedSite || manualSite.trim();
    if (!siteUrl) {
      setError("Select or enter a Search Console property URL");
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await saveGscSiteUrl(websiteId, siteUrl);
      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage("Search Console property saved.");
    });
  }

  function handleSync() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await syncGscData(websiteId);
      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage(
        `Imported ${result.recordsImported?.toLocaleString() ?? 0} GSC records.`,
      );
    });
  }

  function handleDisconnect() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await disconnectGsc(websiteId);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSites([]);
      setSelectedSite("");
      setManualSite("");
      setMessage("Search Console disconnected.");
    });
  }

  const connectUrl = `/api/integrations/google/connect?websiteId=${websiteId}&type=GSC`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Search Console</CardTitle>
        <CardDescription>
          Connect GSC, choose a property, and import search analytics for the
          last 28 days and the previous 28 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Connection</p>
            {integration ? (
              <Badge variant={statusVariant(integration.status)}>
                {integration.status}
              </Badge>
            ) : (
              <Badge variant="secondary">Not connected</Badge>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Property</p>
            <p className="text-sm font-medium">{integration?.siteUrl ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last sync</p>
            <p className="text-sm font-medium">
              {formatDate(integration?.lastSyncedAt)}
            </p>
          </div>
        </div>

        {!oauthConfigured ? (
          <p className="text-sm text-destructive">
            Google OAuth is not configured. Set GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET, and TOKEN_ENCRYPTION_KEY in your environment.
          </p>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}

        {!isConnected ? (
          <Button
            render={<Link href={connectUrl} />}
            disabled={!oauthConfigured}
          >
            Connect Search Console
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gsc-site">Search Console property</Label>
              {sites.length > 0 ? (
                <select
                  id="gsc-site"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={selectedSite}
                  onChange={(event) => setSelectedSite(event.target.value)}
                  disabled={isPending}
                >
                  <option value="">Select a property…</option>
                  {sites.map((site) => (
                    <option key={site} value={site}>
                      {site}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isPending
                    ? "Loading properties…"
                    : "No properties loaded yet. Enter one manually below."}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="gsc-site-manual">Or enter property URL</Label>
                <Input
                  id="gsc-site-manual"
                  placeholder="https://example.com/ or sc-domain:example.com"
                  value={manualSite}
                  onChange={(event) => setManualSite(event.target.value)}
                  disabled={isPending}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveSite}
                disabled={isPending}
              >
                Save property
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleSync}
                disabled={isPending || !integration?.siteUrl}
              >
                Sync GSC data
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDisconnect}
                disabled={isPending}
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {runs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Started</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Date range</TableHead>
                <TableHead>Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>{formatDate(run.startedAt)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(run.status)}>
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{run.recordsImported.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {run.dateStart && run.dateEnd
                      ? `${formatDate(run.dateStart)} – ${formatDate(run.dateEnd)}`
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-destructive">
                    {run.errorMessage ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  );
}
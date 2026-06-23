"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  disconnectGa4,
  listGa4PropertiesForWebsite,
  saveGa4PropertyId,
  syncGa4Data,
} from "@/app/(dashboard)/websites/ga4-actions";
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

type Ga4IntegrationPanelProps = {
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

export function Ga4IntegrationPanel({
  websiteId,
  integration,
  runs,
  oauthConfigured,
}: Ga4IntegrationPanelProps) {
  const [properties, setProperties] = useState<
    Array<{ propertyId: string; displayName: string; account: string }>
  >([]);
  const [selectedProperty, setSelectedProperty] = useState(
    integration?.propertyId ?? "",
  );
  const [manualProperty, setManualProperty] = useState("");
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
      const result = await listGa4PropertiesForWebsite(websiteId);
      if (result.error) {
        setError(result.error);
        return;
      }

      setProperties(result.properties ?? []);
    });
  }, [websiteId, isConnected, hasTokens]);

  function handleSaveProperty() {
    const propertyId = selectedProperty || manualProperty.trim();
    if (!propertyId) {
      setError("Select or enter a GA4 property ID");
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await saveGa4PropertyId(websiteId, propertyId);
      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage("GA4 property saved.");
    });
  }

  function handleSync() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await syncGa4Data(websiteId);
      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage(
        `Imported ${result.recordsImported?.toLocaleString() ?? 0} GA4 landing page records.`,
      );
    });
  }

  function handleDisconnect() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await disconnectGa4(websiteId);
      if (result.error) {
        setError(result.error);
        return;
      }

      setProperties([]);
      setSelectedProperty("");
      setManualProperty("");
      setMessage("Google Analytics disconnected.");
    });
  }

  const connectUrl = `/api/integrations/google/connect?websiteId=${websiteId}&type=GA4`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Analytics 4</CardTitle>
        <CardDescription>
          Connect GA4, choose a property, and import organic landing page data
          for the last 28 days and the previous 28 days.
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
            <p className="text-sm text-muted-foreground">Property ID</p>
            <p className="text-sm font-medium">
              {integration?.propertyId ?? "—"}
            </p>
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
            Connect Google Analytics
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ga4-property">GA4 property</Label>
              {properties.length > 0 ? (
                <select
                  id="ga4-property"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={selectedProperty}
                  onChange={(event) => setSelectedProperty(event.target.value)}
                  disabled={isPending}
                >
                  <option value="">Select a property…</option>
                  {properties.map((property) => (
                    <option key={property.propertyId} value={property.propertyId}>
                      {property.displayName} ({property.propertyId}) —{" "}
                      {property.account}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isPending
                    ? "Loading properties…"
                    : "No properties loaded yet. Enter a property ID manually below."}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="ga4-property-manual">Or enter property ID</Label>
                <Input
                  id="ga4-property-manual"
                  placeholder="123456789"
                  value={manualProperty}
                  onChange={(event) => setManualProperty(event.target.value)}
                  disabled={isPending}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveProperty}
                disabled={isPending}
              >
                Save property
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleSync}
                disabled={isPending || !integration?.propertyId}
              >
                Sync GA4 data
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

"use client";

import { useState, useTransition } from "react";
import { generateWebsiteMonthlyReport } from "@/app/(dashboard)/reports/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type WebsiteOption = {
  id: string;
  name: string;
  clientName: string;
};

type GenerateReportFormProps = {
  websites: WebsiteOption[];
  defaultYear: number;
  defaultMonth: number;
  aiConfigured: boolean;
  preselectedWebsiteId?: string;
};

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, index, 1))),
}));

export function GenerateReportForm({
  websites,
  defaultYear,
  defaultMonth,
  aiConfigured,
  preselectedWebsiteId,
}: GenerateReportFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const websiteId = String(formData.get("websiteId") ?? "");
    const year = Number(formData.get("year"));
    const month = Number(formData.get("month"));

    if (!websiteId) {
      setError("Select a website");
      return;
    }

    startTransition(async () => {
      const result = await generateWebsiteMonthlyReport(websiteId, year, month);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const currentYear = new Date().getUTCFullYear();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!aiConfigured ? (
        <p className="text-sm text-destructive">
          Set OPENAI_API_KEY to generate AI-written report summaries.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-3">
          <Label htmlFor="websiteId">Website</Label>
          <select
            id="websiteId"
            name="websiteId"
            defaultValue={preselectedWebsiteId ?? ""}
            required
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Select website</option>
            {websites.map((website) => (
              <option key={website.id} value={website.id}>
                {website.clientName} — {website.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="month">Month</Label>
          <select
            id="month"
            name="month"
            defaultValue={defaultMonth}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <select
            id="year"
            name="year"
            defaultValue={defaultYear}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={isPending || !aiConfigured || websites.length === 0}>
        {isPending ? "Generating…" : "Generate monthly report"}
      </Button>
    </form>
  );
}

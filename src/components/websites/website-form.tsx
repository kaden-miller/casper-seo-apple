"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CMS_OPTIONS = [
  "WordPress",
  "Webflow",
  "Shopify",
  "Squarespace",
  "Custom",
  "Other",
];

type WebsiteFormProps = {
  action: (
    prev: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string } | undefined>;
  clients: { id: string; name: string }[];
  defaultValues?: {
    clientId?: string;
    name?: string;
    url?: string;
    cmsType?: string | null;
    primaryLocation?: string | null;
    serviceAreas?: string;
    targetServices?: string;
    notes?: string | null;
  };
  submitLabel: string;
  lockClient?: boolean;
};

const selectClassName = cn(
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
);

export function WebsiteForm({
  action,
  clients,
  defaultValues,
  submitLabel,
  lockClient = false,
}: WebsiteFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="clientId">Client</Label>
        <select
          id="clientId"
          name="clientId"
          defaultValue={defaultValues?.clientId}
          required
          disabled={lockClient}
          className={selectClassName}
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Website name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaultValues?.name}
            placeholder="Main website"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            name="url"
            type="url"
            defaultValue={defaultValues?.url}
            placeholder="https://example.com"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cmsType">CMS type</Label>
          <select
            id="cmsType"
            name="cmsType"
            defaultValue={defaultValues?.cmsType ?? ""}
            className={selectClassName}
          >
            <option value="">Select CMS</option>
            {CMS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="primaryLocation">Primary location</Label>
          <Input
            id="primaryLocation"
            name="primaryLocation"
            defaultValue={defaultValues?.primaryLocation ?? ""}
            placeholder="Wichita, KS"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceAreas">Service areas</Label>
        <Input
          id="serviceAreas"
          name="serviceAreas"
          defaultValue={defaultValues?.serviceAreas}
          placeholder="Wichita, Derby, Andover (comma-separated)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetServices">Target services</Label>
        <Input
          id="targetServices"
          name="targetServices"
          defaultValue={defaultValues?.targetServices}
          placeholder="Lawn care, landscaping, snow removal (comma-separated)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="Internal notes about this website"
          rows={3}
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

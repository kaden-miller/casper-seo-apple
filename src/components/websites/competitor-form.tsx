"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CompetitorFormProps = {
  action: (
    prev: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string } | undefined>;
  websiteId: string;
};

export function CompetitorForm({ action, websiteId }: CompetitorFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
      <input type="hidden" name="websiteId" value={websiteId} />

      <div className="space-y-2">
        <Label htmlFor="competitor-name">Competitor name</Label>
        <Input id="competitor-name" name="name" placeholder="Green Lawn Co" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Input id="domain" name="domain" placeholder="greenlawn.com" required />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="competitor-notes">Notes</Label>
        <Textarea id="competitor-notes" name="notes" rows={2} />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
      ) : null}

      <div className="md:col-span-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding..." : "Add competitor"}
        </Button>
      </div>
    </form>
  );
}

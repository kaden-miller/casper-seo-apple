"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
);

type KeywordFormProps = {
  action: (
    prev: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string } | undefined>;
  websiteId: string;
};

export function KeywordForm({ action, websiteId }: KeywordFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
      <input type="hidden" name="websiteId" value={websiteId} />

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="keyword">Keyword</Label>
        <Input id="keyword" name="keyword" placeholder="lawn care wichita" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetUrl">Target URL</Label>
        <Input id="targetUrl" name="targetUrl" type="url" placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" placeholder="Wichita, KS" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="device">Device</Label>
        <select id="device" name="device" defaultValue="DESKTOP" className={selectClassName}>
          <option value="DESKTOP">Desktop</option>
          <option value="MOBILE">Mobile</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <select id="priority" name="priority" defaultValue="MEDIUM" className={selectClassName}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="keyword-notes">Notes</Label>
        <Textarea id="keyword-notes" name="notes" rows={2} />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
      ) : null}

      <div className="md:col-span-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding..." : "Add keyword"}
        </Button>
      </div>
    </form>
  );
}

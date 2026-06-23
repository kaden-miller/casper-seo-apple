"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ClientFormProps = {
  action: (
    prev: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string } | undefined>;
  defaultValues?: {
    name?: string;
    businessDescription?: string;
    industry?: string;
    notes?: string;
  };
  submitLabel: string;
};

export function ClientForm({ action, defaultValues, submitLabel }: ClientFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Client name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="Acme Lawn Care"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          name="industry"
          defaultValue={defaultValues?.industry}
          placeholder="Home services"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessDescription">Business description</Label>
        <Textarea
          id="businessDescription"
          name="businessDescription"
          defaultValue={defaultValues?.businessDescription}
          placeholder="What does this business do?"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes}
          placeholder="Internal notes about this client"
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

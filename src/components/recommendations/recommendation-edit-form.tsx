"use client";

import { useActionState } from "react";
import { updateRecommendation } from "@/app/(dashboard)/recommendations/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Recommendation } from "@/generated/prisma/client";

type RecommendationEditFormProps = {
  recommendation: Pick<
    Recommendation,
    | "id"
    | "title"
    | "description"
    | "reason"
    | "currentValue"
    | "suggestedValue"
    | "priority"
    | "impact"
    | "effort"
    | "risk"
  >;
};

const levelOptions = ["LOW", "MEDIUM", "HIGH"] as const;
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function RecommendationEditForm({
  recommendation,
}: RecommendationEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateRecommendation.bind(null, recommendation.id),
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={recommendation.title} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={recommendation.description}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          name="reason"
          defaultValue={recommendation.reason}
          rows={3}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currentValue">Current value</Label>
          <Textarea
            id="currentValue"
            name="currentValue"
            defaultValue={recommendation.currentValue ?? ""}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="suggestedValue">Suggested value</Label>
          <Textarea
            id="suggestedValue"
            name="suggestedValue"
            defaultValue={recommendation.suggestedValue ?? ""}
            rows={3}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            name="priority"
            defaultValue={recommendation.priority}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {priorityOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="impact">Impact</Label>
          <select
            id="impact"
            name="impact"
            defaultValue={recommendation.impact}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {levelOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="effort">Effort</Label>
          <select
            id="effort"
            name="effort"
            defaultValue={recommendation.effort}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {levelOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="risk">Risk</Label>
          <select
            id="risk"
            name="risk"
            defaultValue={recommendation.risk}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {levelOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm text-muted-foreground">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        Save changes
      </Button>
    </form>
  );
}

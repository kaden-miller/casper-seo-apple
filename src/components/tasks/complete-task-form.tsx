"use client";

import { useActionState } from "react";
import { completeTask } from "@/app/(dashboard)/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/generated/prisma/client";

type CompleteTaskFormProps = {
  task: Pick<
    Task,
    "id" | "title" | "beforeValue" | "afterValue" | "url" | "status"
  >;
};

export function CompleteTaskForm({ task }: CompleteTaskFormProps) {
  const [state, formAction, isPending] = useActionState(
    completeTask.bind(null, task.id),
    undefined,
  );

  if (task.status === "COMPLETED") {
    return (
      <p className="text-sm text-muted-foreground">
        This task is completed. See the change log below for details.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="changeType">Change type</Label>
        <Input
          id="changeType"
          name="changeType"
          placeholder="e.g. title_tag, meta_description, content_update"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fieldChanged">Field changed</Label>
        <Input
          id="fieldChanged"
          name="fieldChanged"
          placeholder="e.g. title, meta description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="afterValue">After value</Label>
        <Textarea
          id="afterValue"
          name="afterValue"
          defaultValue={task.afterValue ?? ""}
          placeholder={task.beforeValue ? "New value after the change" : undefined}
          rows={4}
        />
        {task.beforeValue ? (
          <p className="text-xs text-muted-foreground">
            Before: {task.beforeValue}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="completionNotes">Completion notes</Label>
        <Textarea
          id="completionNotes"
          name="completionNotes"
          placeholder="What was done and why"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="measureAfterDate">Measure after date (optional)</Label>
        <Input id="measureAfterDate" name="measureAfterDate" type="date" />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm text-muted-foreground">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        Complete task & create change log
      </Button>
    </form>
  );
}

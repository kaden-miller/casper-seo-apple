"use client";

import { useState, useTransition } from "react";
import { updateTaskStatus } from "@/app/(dashboard)/tasks/actions";
import { Button } from "@/components/ui/button";
import type { TaskStatus } from "@/generated/prisma/client";

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "Todo" },
  { value: "NEEDS_REVIEW", label: "Needs review" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "SKIPPED", label: "Skipped" },
];

type TaskStatusActionsProps = {
  taskId: string;
  status: TaskStatus;
};

export function TaskStatusActions({ taskId, status }: TaskStatusActionsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (status === "COMPLETED") {
    return null;
  }

  function handleStatusChange(nextStatus: TaskStatus) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateTaskStatus(taskId, nextStatus);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.success ?? "Status updated");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {statusOptions
          .filter((option) => option.value !== status)
          .map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleStatusChange(option.value)}
            >
              Mark {option.label.toLowerCase()}
            </Button>
          ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}

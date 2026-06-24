"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  approveRecommendation,
  convertRecommendationToTask,
  rejectRecommendation,
} from "@/app/(dashboard)/recommendations/actions";
import { Button } from "@/components/ui/button";
import type { RecommendationStatus } from "@/generated/prisma/client";

type RecommendationWorkflowActionsProps = {
  recommendationId: string;
  status: RecommendationStatus;
  hasTask: boolean;
  taskId?: string;
};

export function RecommendationWorkflowActions({
  recommendationId,
  status,
  hasTask,
  taskId,
}: RecommendationWorkflowActionsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canApprove =
    status !== "APPROVED" &&
    status !== "REJECTED" &&
    status !== "COMPLETED" &&
    status !== "CONVERTED_TO_TASK";
  const canReject =
    status !== "REJECTED" &&
    status !== "COMPLETED" &&
    status !== "CONVERTED_TO_TASK";
  const canConvert =
    status !== "REJECTED" &&
    status !== "COMPLETED" &&
    !hasTask;

  function runAction(action: () => Promise<{ error?: string; success?: string }>) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.success ?? "Updated");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {canApprove ? (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => runAction(() => approveRecommendation(recommendationId))}
          >
            Approve
          </Button>
        ) : null}
        {canReject ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => runAction(() => rejectRecommendation(recommendationId))}
          >
            Reject
          </Button>
        ) : null}
        {hasTask && taskId ? (
          <Button
            variant="outline"
            render={<Link href={`/tasks/${taskId}`} />}
          >
            View task
          </Button>
        ) : canConvert ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => convertRecommendationToTask(recommendationId)}
          >
            Convert to task
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}

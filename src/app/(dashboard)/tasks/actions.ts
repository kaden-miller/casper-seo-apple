"use server";

import { revalidatePath } from "next/cache";
import type { TaskStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { taskRepository } from "@/lib/repositories";
import { completeTaskSchema } from "@/lib/validations/workflow";

type ActionResult = { error?: string; success?: string };

const OPEN_STATUSES: TaskStatus[] = [
  "TODO",
  "NEEDS_REVIEW",
  "APPROVED",
  "IN_PROGRESS",
  "BLOCKED",
];

function revalidateTaskPaths(taskId: string, websiteId: string) {
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/websites/${websiteId}`);
  revalidatePath("/dashboard");
}

async function getTaskOrError(taskId: string) {
  const task = await taskRepository.getById(taskId);
  if (!task) {
    return { error: "Task not found" as const };
  }
  return { task };
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<ActionResult> {
  const result = await getTaskOrError(taskId);
  if ("error" in result) {
    return result;
  }

  const { task } = result;

  if (task.status === "COMPLETED") {
    return { error: "Completed tasks cannot change status" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  revalidateTaskPaths(taskId, task.websiteId);
  return { success: `Task marked as ${status.replaceAll("_", " ").toLowerCase()}` };
}

export async function completeTask(
  taskId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const result = await getTaskOrError(taskId);
  if ("error" in result) {
    return result;
  }

  const { task } = result;

  if (task.status === "COMPLETED") {
    return { error: "Task is already completed" };
  }

  const parsed = completeTaskSchema.safeParse({
    afterValue: formData.get("afterValue") || undefined,
    completionNotes: formData.get("completionNotes"),
    changeType: formData.get("changeType"),
    fieldChanged: formData.get("fieldChanged") || undefined,
    measureAfterDate: formData.get("measureAfterDate") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const { dbUser } = await getCurrentUser();
  const url = task.url ?? task.page?.url ?? task.website.url;
  const measureAfterDate = parsed.data.measureAfterDate
    ? new Date(parsed.data.measureAfterDate)
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
        afterValue: parsed.data.afterValue ?? null,
        completionNotes: parsed.data.completionNotes,
        completedAt: new Date(),
      },
    });

    await tx.changeLog.create({
      data: {
        websiteId: task.websiteId,
        clientId: task.clientId,
        taskId: task.id,
        recommendationId: task.recommendationId,
        pageId: task.pageId,
        url,
        changeType: parsed.data.changeType,
        fieldChanged: parsed.data.fieldChanged ?? null,
        oldValue: task.beforeValue,
        newValue: parsed.data.afterValue ?? null,
        reason: parsed.data.completionNotes,
        changedByUserId: dbUser.id,
        measureAfterDate,
      },
    });

    if (task.recommendationId) {
      await tx.recommendation.update({
        where: { id: task.recommendationId },
        data: { status: "COMPLETED" },
      });
    }
  });

  revalidateTaskPaths(taskId, task.websiteId);
  if (task.recommendationId) {
    revalidatePath(`/recommendations/${task.recommendationId}`);
    revalidatePath("/recommendations");
  }

  return { success: "Task completed and change log created" };
}

export { OPEN_STATUSES };

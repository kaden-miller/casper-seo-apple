"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { recommendationRepository } from "@/lib/repositories";
import { recommendationEditSchema } from "@/lib/validations/workflow";

type ActionResult = { error?: string; success?: string };

function revalidateRecommendationPaths(recommendationId: string, websiteId: string) {
  revalidatePath("/recommendations");
  revalidatePath(`/recommendations/${recommendationId}`);
  revalidatePath(`/websites/${websiteId}`);
  revalidatePath("/dashboard");
}

async function getRecommendationOrError(recommendationId: string) {
  const recommendation = await recommendationRepository.getById(recommendationId);
  if (!recommendation) {
    return { error: "Recommendation not found" as const };
  }
  return { recommendation };
}

export async function approveRecommendation(
  recommendationId: string,
): Promise<ActionResult> {
  const result = await getRecommendationOrError(recommendationId);
  if ("error" in result) {
    return result;
  }

  const { recommendation } = result;
  if (recommendation.status === "REJECTED") {
    return { error: "Cannot approve a rejected recommendation" };
  }

  await prisma.recommendation.update({
    where: { id: recommendationId },
    data: { status: "APPROVED" },
  });

  revalidateRecommendationPaths(recommendationId, recommendation.websiteId);
  return { success: "Recommendation approved" };
}

export async function rejectRecommendation(
  recommendationId: string,
): Promise<ActionResult> {
  const result = await getRecommendationOrError(recommendationId);
  if ("error" in result) {
    return result;
  }

  const { recommendation } = result;

  await prisma.recommendation.update({
    where: { id: recommendationId },
    data: { status: "REJECTED" },
  });

  revalidateRecommendationPaths(recommendationId, recommendation.websiteId);
  return { success: "Recommendation rejected" };
}

export async function updateRecommendation(
  recommendationId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const result = await getRecommendationOrError(recommendationId);
  if ("error" in result) {
    return result;
  }

  const parsed = recommendationEditSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    reason: formData.get("reason"),
    currentValue: formData.get("currentValue") || undefined,
    suggestedValue: formData.get("suggestedValue") || undefined,
    priority: formData.get("priority"),
    impact: formData.get("impact"),
    effort: formData.get("effort"),
    risk: formData.get("risk"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const { recommendation } = result;

  await prisma.recommendation.update({
    where: { id: recommendationId },
    data: {
      ...parsed.data,
      currentValue: parsed.data.currentValue ?? null,
      suggestedValue: parsed.data.suggestedValue ?? null,
      status:
        recommendation.status === "DETECTED"
          ? "NEEDS_REVIEW"
          : recommendation.status,
    },
  });

  revalidateRecommendationPaths(recommendationId, recommendation.websiteId);
  return { success: "Recommendation updated" };
}

export async function convertRecommendationToTask(
  recommendationId: string,
): Promise<ActionResult> {
  const result = await getRecommendationOrError(recommendationId);
  if ("error" in result) {
    return result;
  }

  const { recommendation } = result;

  if (recommendation.status === "REJECTED") {
    return { error: "Cannot convert a rejected recommendation" };
  }

  if (recommendation.tasks.length > 0) {
    const existingTask = recommendation.tasks[0];
    redirect(`/tasks/${existingTask.id}`);
  }

  const pageUrl = recommendation.page?.url ?? null;

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        websiteId: recommendation.websiteId,
        clientId: recommendation.clientId,
        recommendationId: recommendation.id,
        pageId: recommendation.pageId,
        title: recommendation.title,
        description: recommendation.description,
        humanInstructions: recommendation.suggestedValue
          ? `Suggested change: ${recommendation.suggestedValue}`
          : recommendation.reason,
        url: pageUrl,
        beforeValue: recommendation.currentValue,
        suggestedCopy: recommendation.suggestedValue,
        priority: recommendation.priority,
        status: "TODO",
      },
    });

    await tx.recommendation.update({
      where: { id: recommendationId },
      data: { status: "CONVERTED_TO_TASK" },
    });

    return created;
  });

  revalidatePath("/tasks");
  revalidatePath("/recommendations");
  revalidatePath(`/recommendations/${recommendationId}`);
  revalidatePath(`/websites/${recommendation.websiteId}`);
  redirect(`/tasks/${task.id}`);
}

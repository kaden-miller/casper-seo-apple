"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserOrganization } from "@/lib/auth/session";
import { getClientForUser } from "@/lib/data/seo";
import { prisma } from "@/lib/db";
import { clientSchema } from "@/lib/validations/seo";

type ActionState = { error?: string } | undefined;

export async function createClient(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    businessDescription: formData.get("businessDescription") || undefined,
    industry: formData.get("industry") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const organization = await getUserOrganization();

  const client = await prisma.client.create({
    data: {
      ...parsed.data,
      organizationId: organization.id,
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(
  clientId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const existing = await getClientForUser(clientId);
  if (!existing) {
    return { error: "Client not found" };
  }

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    businessDescription: formData.get("businessDescription") || undefined,
    industry: formData.get("industry") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  await prisma.client.update({
    where: { id: clientId },
    data: parsed.data,
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  const existing = await getClientForUser(clientId);
  if (!existing) {
    redirect("/clients");
  }

  await prisma.client.delete({ where: { id: clientId } });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  redirect("/clients");
}

import { prisma } from "@/lib/db";

type SyncUserInput = {
  id: string;
  email: string;
  name?: string | null;
};

export async function syncUser({ id, email, name }: SyncUserInput) {
  return prisma.user.upsert({
    where: { id },
    update: {
      email,
      name: name ?? undefined,
    },
    create: {
      id,
      email,
      name: name ?? null,
    },
  });
}

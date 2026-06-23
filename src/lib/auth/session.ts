import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { syncUser } from "@/lib/users/sync-user";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await syncUser({
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.full_name ?? user.user_metadata?.name,
  });

  return { supabaseUser: user, dbUser };
}

export async function getUserOrganization() {
  const { dbUser } = await getCurrentUser();

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: dbUser.id },
    include: { organization: true },
  });

  if (membership) {
    return membership.organization;
  }

  const orgName = dbUser.name
    ? `${dbUser.name}'s Workspace`
    : `${dbUser.email.split("@")[0]}'s Workspace`;

  const organization = await prisma.organization.create({
    data: {
      name: orgName,
      members: {
        create: {
          userId: dbUser.id,
          role: "OWNER",
        },
      },
    },
  });

  return organization;
}

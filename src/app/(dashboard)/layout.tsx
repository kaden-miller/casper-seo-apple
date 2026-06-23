import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/app-sidebar";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <div className="flex h-14 items-center justify-end border-b px-4 sm:px-6">
        <UserNav
          email={user.email ?? ""}
          name={
            user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
          }
        />
      </div>
      {children}
    </DashboardShell>
  );
}

import Link from "next/link";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { WebsiteForm } from "@/components/websites/website-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createWebsite } from "@/app/(dashboard)/websites/actions";
import { listClientsForUser } from "@/lib/data/seo";

type NewWebsitePageProps = {
  searchParams: Promise<{ clientId?: string }>;
};

export default async function NewWebsitePage({
  searchParams,
}: NewWebsitePageProps) {
  const { clientId } = await searchParams;
  const clients = await listClientsForUser();

  return (
    <>
      <DashboardHeader
        title="Add website"
        description="Add a website to a client."
        actions={
          <Button variant="outline" render={<Link href="/websites" />}>
            Cancel
          </Button>
        }
      />
      <DashboardContent>
        {clients.length === 0 ? (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Create a client first</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                You need at least one client before adding a website.
              </p>
              <Button render={<Link href="/clients/new" />}>Add client</Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Website details</CardTitle>
            </CardHeader>
            <CardContent>
              <WebsiteForm
                action={createWebsite}
                clients={clients}
                submitLabel="Create website"
                defaultValues={{ clientId }}
              />
            </CardContent>
          </Card>
        )}
      </DashboardContent>
    </>
  );
}

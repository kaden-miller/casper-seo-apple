import Link from "next/link";
import { notFound } from "next/navigation";
import { updateWebsite } from "@/app/(dashboard)/websites/actions";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { WebsiteForm } from "@/components/websites/website-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWebsiteForUser, listClientsForUser } from "@/lib/data/seo";
import { formatCommaList } from "@/lib/utils/form";

type EditWebsitePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditWebsitePage({ params }: EditWebsitePageProps) {
  const { id } = await params;
  const [website, clients] = await Promise.all([
    getWebsiteForUser(id),
    listClientsForUser(),
  ]);

  if (!website) {
    notFound();
  }

  const boundAction = updateWebsite.bind(null, id);

  return (
    <>
      <DashboardHeader
        title={`Edit ${website.name}`}
        description="Update website details."
        actions={
          <Button variant="outline" render={<Link href={`/websites/${id}`} />}>
            Cancel
          </Button>
        }
      />
      <DashboardContent>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Website details</CardTitle>
          </CardHeader>
          <CardContent>
            <WebsiteForm
              action={boundAction}
              clients={clients}
              submitLabel="Save changes"
              lockClient
              defaultValues={{
                clientId: website.clientId,
                name: website.name,
                url: website.url,
                cmsType: website.cmsType,
                primaryLocation: website.primaryLocation,
                serviceAreas: formatCommaList(website.serviceAreas),
                targetServices: formatCommaList(website.targetServices),
                notes: website.notes,
              }}
            />
          </CardContent>
        </Card>
      </DashboardContent>
    </>
  );
}

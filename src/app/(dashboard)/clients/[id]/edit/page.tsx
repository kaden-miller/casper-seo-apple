import Link from "next/link";
import { notFound } from "next/navigation";
import { updateClient } from "@/app/(dashboard)/clients/actions";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { ClientForm } from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientForUser } from "@/lib/data/seo";

type EditClientPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const client = await getClientForUser(id);

  if (!client) {
    notFound();
  }

  const boundAction = updateClient.bind(null, id);

  return (
    <>
      <DashboardHeader
        title={`Edit ${client.name}`}
        description="Update client business details."
        actions={
          <Button variant="outline" render={<Link href={`/clients/${id}`} />}>
            Cancel
          </Button>
        }
      />
      <DashboardContent>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Client details</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm
              action={boundAction}
              submitLabel="Save changes"
              defaultValues={{
                name: client.name,
                businessDescription: client.businessDescription ?? "",
                industry: client.industry ?? "",
                notes: client.notes ?? "",
              }}
            />
          </CardContent>
        </Card>
      </DashboardContent>
    </>
  );
}

import Link from "next/link";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { ClientForm } from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/app/(dashboard)/clients/actions";

export default function NewClientPage() {
  return (
    <>
      <DashboardHeader
        title="Add client"
        description="Create a new client business."
        actions={
          <Button variant="outline" render={<Link href="/clients" />}>
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
            <ClientForm action={createClient} submitLabel="Create client" />
          </CardContent>
        </Card>
      </DashboardContent>
    </>
  );
}

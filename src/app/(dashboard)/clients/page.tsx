import Link from "next/link";
import { Plus } from "lucide-react";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listClientsForUser } from "@/lib/data/seo";

export default async function ClientsPage() {
  const clients = await listClientsForUser();

  return (
    <>
      <DashboardHeader
        title="Clients"
        description="Manage client businesses and their websites."
        actions={
          <Button render={<Link href="/clients/new" />}>
            <Plus className="size-4" />
            Add client
          </Button>
        }
      />
      <DashboardContent>
        {clients.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No clients yet</CardTitle>
              <CardDescription>
                Create your first client to start tracking websites and SEO work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/clients/new" />}>
                <Plus className="size-4" />
                Add client
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Websites</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/clients/${client.id}`}
                        className="hover:underline"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{client.industry ?? "—"}</TableCell>
                    <TableCell>{client._count.websites}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        render={<Link href={`/clients/${client.id}`} />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </DashboardContent>
    </>
  );
}

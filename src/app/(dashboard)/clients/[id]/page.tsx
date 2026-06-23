import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteClient } from "@/app/(dashboard)/clients/actions";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
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
import { getClientForUser } from "@/lib/data/seo";

type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const client = await getClientForUser(id);

  if (!client) {
    notFound();
  }

  return (
    <>
      <DashboardHeader
        title={client.name}
        description={client.industry ?? "Client overview"}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              render={<Link href={`/clients/${client.id}/edit`} />}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              render={
                <Link href={`/websites/new?clientId=${client.id}`} />
              }
            >
              <Plus className="size-4" />
              Add website
            </Button>
            <form action={deleteClient.bind(null, client.id)}>
              <Button type="submit" variant="destructive">
                <Trash2 className="size-4" />
                Delete
              </Button>
            </form>
          </div>
        }
      />
      <DashboardContent>
        <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Business context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Industry</p>
                <p>{client.industry ?? "—"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Description</p>
                <p className="whitespace-pre-wrap">
                  {client.businessDescription ?? "—"}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{client.notes ?? "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Websites</span>
                <Badge>{client.websites.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total keywords</span>
                <Badge variant="secondary">
                  {client.websites.reduce((sum, w) => sum + w._count.keywords, 0)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total competitors</span>
                <Badge variant="secondary">
                  {client.websites.reduce(
                    (sum, w) => sum + w._count.competitors,
                    0,
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Websites</CardTitle>
            <CardDescription>
              Websites belonging to this client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {client.websites.length === 0 ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted-foreground">
                  No websites yet for this client.
                </p>
                <Button
                  render={
                    <Link href={`/websites/new?clientId=${client.id}`} />
                  }
                >
                  <Plus className="size-4" />
                  Add website
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>CMS</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.websites.map((website) => (
                    <TableRow key={website.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/websites/${website.id}`}
                          className="hover:underline"
                        >
                          {website.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm hover:underline"
                        >
                          {website.url}
                        </a>
                      </TableCell>
                      <TableCell>{website.cmsType ?? "—"}</TableCell>
                      <TableCell>{website._count.keywords}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          render={<Link href={`/websites/${website.id}`} />}
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        </div>
      </DashboardContent>
    </>
  );
}

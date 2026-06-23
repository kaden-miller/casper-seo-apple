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
import { listWebsitesForUser } from "@/lib/data/seo";

export default async function WebsitesPage() {
  const websites = await listWebsitesForUser();

  return (
    <>
      <DashboardHeader
        title="Websites"
        description="All websites across your clients."
        actions={
          <Button render={<Link href="/websites/new" />}>
            <Plus className="size-4" />
            Add website
          </Button>
        }
      />
      <DashboardContent>
        {websites.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No websites yet</CardTitle>
              <CardDescription>
                Add a website to a client to start SEO tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/websites/new" />}>
                <Plus className="size-4" />
                Add website
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Website</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {websites.map((website) => (
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
                      <Link
                        href={`/clients/${website.client.id}`}
                        className="hover:underline"
                      >
                        {website.client.name}
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
          </Card>
        )}
      </DashboardContent>
    </>
  );
}

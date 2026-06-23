import Link from "next/link";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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
import { pageRepository } from "@/lib/repositories";

export default async function PagesPage() {
  const pages = await pageRepository.listAllForOrganization();

  return (
    <>
      <DashboardHeader
        title="Pages"
        description="Page inventory across all websites."
      />
      <DashboardContent>
        {pages.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No pages yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Run a crawl from a website dashboard to populate the page inventory.
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
                  <TableHead>Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Words</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => {
                  const snapshot = page.snapshots[0];
                  return (
                    <TableRow key={page.id}>
                      <TableCell>
                        <Link
                          href={`/websites/${page.websiteId}`}
                          className="hover:underline"
                        >
                          {page.website.name}
                        </Link>
                      </TableCell>
                      <TableCell>{page.website.client.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        <Link
                          href={`/websites/${page.websiteId}/pages/${page.id}`}
                          className="hover:underline"
                        >
                          {page.url}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{page.status}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {snapshot?.title ?? "—"}
                      </TableCell>
                      <TableCell>{snapshot?.wordCount ?? "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </DashboardContent>
    </>
  );
}

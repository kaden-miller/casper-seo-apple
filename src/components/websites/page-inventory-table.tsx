import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
import type { Page, PageSnapshot } from "@/generated/prisma/client";

type PageWithSnapshot = Page & {
  snapshots: PageSnapshot[];
};

type PageInventoryTableProps = {
  pages: PageWithSnapshot[];
  websiteId: string;
};

export function PageInventoryTable({ pages, websiteId }: PageInventoryTableProps) {
  if (pages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Page inventory</CardTitle>
          <CardDescription>
            Run a crawl to populate pages from this website.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page inventory</CardTitle>
        <CardDescription>
          {pages.length} pages from the latest crawl.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>H1</TableHead>
              <TableHead>Words</TableHead>
              <TableHead>Issues</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => {
              const snapshot = page.snapshots[0];
              const issues: string[] = [];

              if (!snapshot?.title) issues.push("No title");
              if (!snapshot?.metaDescription) issues.push("No meta");
              if (!snapshot?.h1) issues.push("No H1");
              if ((snapshot?.imagesMissingAltCount ?? 0) > 0) {
                issues.push(`${snapshot?.imagesMissingAltCount} imgs no alt`);
              }

              return (
                <TableRow key={page.id}>
                  <TableCell className="max-w-xs truncate">
                    <Link
                      href={`/websites/${websiteId}/pages/${page.id}`}
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
                  <TableCell className="max-w-[160px] truncate">
                    {snapshot?.h1 ?? "—"}
                  </TableCell>
                  <TableCell>{snapshot?.wordCount ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {issues.length > 0 ? issues.join(", ") : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

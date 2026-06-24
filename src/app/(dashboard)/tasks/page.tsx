import Link from "next/link";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { TaskStatus } from "@/generated/prisma/client";
import { listWebsitesForUser } from "@/lib/data/seo";
import {
  formatEnumLabel,
  priorityVariant,
  taskStatusVariant,
} from "@/lib/format-workflow";
import { taskRepository } from "@/lib/repositories";

type TasksPageProps = {
  searchParams: Promise<{
    websiteId?: string;
    status?: string;
  }>;
};

function parseStatus(value?: string): TaskStatus | undefined {
  const options: TaskStatus[] = [
    "TODO",
    "NEEDS_REVIEW",
    "APPROVED",
    "IN_PROGRESS",
    "COMPLETED",
    "SKIPPED",
    "BLOCKED",
  ];
  return options.includes(value as TaskStatus) ? (value as TaskStatus) : undefined;
}

const boardStatuses: TaskStatus[] = [
  "TODO",
  "NEEDS_REVIEW",
  "APPROVED",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "SKIPPED",
];

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const filters = {
    websiteId: params.websiteId,
    status: parseStatus(params.status),
  };

  const [tasks, websites] = await Promise.all([
    taskRepository.listForOrganization(filters),
    listWebsitesForUser(),
  ]);

  const grouped = boardStatuses.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status),
  }));

  return (
    <>
      <DashboardHeader
        title="Tasks"
        description="Track SEO work from recommendation through completion."
      />
      <DashboardContent>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="get" className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label htmlFor="websiteId" className="text-xs text-muted-foreground">
                  Website
                </label>
                <select
                  id="websiteId"
                  name="websiteId"
                  defaultValue={params.websiteId ?? ""}
                  className="flex h-8 min-w-48 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">All websites</option>
                  {websites.map((website) => (
                    <option key={website.id} value={website.id}>
                      {website.client.name} — {website.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="status" className="text-xs text-muted-foreground">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={params.status ?? ""}
                  className="flex h-8 min-w-40 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">All statuses</option>
                  {boardStatuses.map((status) => (
                    <option key={status} value={status}>
                      {formatEnumLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" variant="outline">
                Apply
              </Button>
              <Button variant="ghost" render={<Link href="/tasks" />}>
                Clear
              </Button>
            </form>
          </CardContent>
        </Card>

        {tasks.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No tasks yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Convert an approved recommendation into a task to start tracking work.
            </CardContent>
          </Card>
        ) : params.status ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      <Link href={`/tasks/${task.id}`} className="hover:underline">
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell>{task.website.client.name}</TableCell>
                    <TableCell>{task.website.name}</TableCell>
                    <TableCell>
                      <Badge variant={priorityVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={taskStatusVariant(task.status)}>
                        {formatEnumLabel(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {task.url ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {grouped
              .filter((column) => column.tasks.length > 0)
              .map((column) => (
                <Card key={column.status}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{formatEnumLabel(column.status)}</span>
                      <Badge variant="secondary">{column.tasks.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {column.tasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/tasks/${task.id}`}
                        className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <p className="font-medium">{task.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {task.website.client.name} · {task.website.name}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant={priorityVariant(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </DashboardContent>
    </>
  );
}

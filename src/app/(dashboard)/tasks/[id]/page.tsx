import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { CompleteTaskForm } from "@/components/tasks/complete-task-form";
import { TaskStatusActions } from "@/components/tasks/task-status-actions";
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
import {
  formatEnumLabel,
  priorityVariant,
  taskStatusVariant,
} from "@/lib/format-workflow";
import { taskRepository } from "@/lib/repositories";

type TaskDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const task = await taskRepository.getById(id);

  if (!task) {
    notFound();
  }

  return (
    <>
      <DashboardHeader
        title={task.title}
        description={`${task.website.client.name} · ${task.website.name}`}
        actions={
          <Button variant="outline" render={<Link href="/tasks" />}>
            Back to tasks
          </Button>
        }
      />
      <DashboardContent>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={taskStatusVariant(task.status)}>
                  {formatEnumLabel(task.status)}
                </Badge>
                <Badge variant={priorityVariant(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
              <TaskStatusActions taskId={task.id} status={task.status} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Task details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Description</p>
                  <p className="whitespace-pre-wrap">{task.description ?? "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Human instructions</p>
                  <p className="whitespace-pre-wrap">
                    {task.humanInstructions ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">URL</p>
                  <p>{task.url ?? task.page?.url ?? "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Suggested copy</p>
                  <p className="whitespace-pre-wrap">{task.suggestedCopy ?? "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Before value</p>
                  <p className="whitespace-pre-wrap">{task.beforeValue ?? "—"}</p>
                </div>
                {task.afterValue ? (
                  <div>
                    <p className="font-medium text-muted-foreground">After value</p>
                    <p className="whitespace-pre-wrap">{task.afterValue}</p>
                  </div>
                ) : null}
                {task.completionNotes ? (
                  <div>
                    <p className="font-medium text-muted-foreground">Completion notes</p>
                    <p className="whitespace-pre-wrap">{task.completionNotes}</p>
                  </div>
                ) : null}
                {task.recommendation ? (
                  <div>
                    <p className="font-medium text-muted-foreground">Recommendation</p>
                    <Link
                      href={`/recommendations/${task.recommendation.id}`}
                      className="hover:underline"
                    >
                      {task.recommendation.title}
                    </Link>
                  </div>
                ) : null}
                {task.completedAt ? (
                  <div>
                    <p className="font-medium text-muted-foreground">Completed</p>
                    <p>{task.completedAt.toLocaleString()}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Complete task</CardTitle>
                <CardDescription>
                  Record what changed. Completing creates a change log entry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompleteTaskForm task={task} />
              </CardContent>
            </Card>
          </div>

          {task.changeLogs.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Change log</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Old value</TableHead>
                      <TableHead>New value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {task.changeLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.changedAt.toLocaleDateString()}</TableCell>
                        <TableCell>{log.changeType}</TableCell>
                        <TableCell>{log.fieldChanged ?? "—"}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.oldValue ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.newValue ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </DashboardContent>
    </>
  );
}

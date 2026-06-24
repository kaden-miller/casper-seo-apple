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
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { listClientsForUser, listWebsitesForUser } from "@/lib/data/seo";
import { prisma } from "@/lib/db";
import {
  recommendationRepository,
  taskRepository,
} from "@/lib/repositories";

async function getDbStatus(): Promise<"ok" | "error"> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "error";
  }
}

export default async function DashboardPage() {
  const [dbStatus, clients, websites, openRecommendations, openTasks] =
    await Promise.all([
    getDbStatus(),
    listClientsForUser(),
    listWebsitesForUser(),
    recommendationRepository.countOpenForOrganization(),
    taskRepository.countOpenForOrganization(),
  ]);

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description="Overview across all clients and SEO operations."
      />
      <DashboardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Active clients</CardTitle>
              <CardDescription>Clients you are managing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{clients.length}</p>
              <Link
                href="/clients"
                className="mt-1 inline-block text-sm text-muted-foreground hover:underline"
              >
                View all clients
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Websites</CardTitle>
              <CardDescription>Tracked client websites</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{websites.length}</p>
              <Link
                href="/websites"
                className="mt-1 inline-block text-sm text-muted-foreground hover:underline"
              >
                View all websites
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open recommendations</CardTitle>
              <CardDescription>Detected, in review, or approved</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{openRecommendations}</p>
              <Link
                href="/recommendations"
                className="mt-1 inline-block text-sm text-muted-foreground hover:underline"
              >
                Review recommendations
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open tasks</CardTitle>
              <CardDescription>Work in progress across clients</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{openTasks}</p>
              <Link
                href="/tasks"
                className="mt-1 inline-block text-sm text-muted-foreground hover:underline"
              >
                View task board
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data sync status</CardTitle>
              <CardDescription>Database and integration health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database connection</span>
                <Badge variant={dbStatus === "ok" ? "default" : "destructive"}>
                  {dbStatus === "ok" ? "Connected" : "Unavailable"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GSC sync</span>
                <Badge variant="secondary">Not connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GA4 sync</span>
                <Badge variant="secondary">Not connected</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardContent>
    </>
  );
}

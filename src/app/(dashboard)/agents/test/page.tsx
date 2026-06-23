import {
  DashboardContent,
  DashboardHeader,
} from "@/components/app-sidebar";
import { TestAgentRunner } from "@/components/agents/test-agent-runner";
import { listEnabledAgents } from "@/lib/agents";
import { isAiConfigured } from "@/lib/ai/agent-model-config";
import { listWebsitesForUser } from "@/lib/data/seo";

export default async function AgentTestPage() {
  const [websites, agents] = await Promise.all([
    listWebsitesForUser(),
    Promise.resolve(listEnabledAgents()),
  ]);

  return (
    <>
      <DashboardHeader
        title="Agent test runner"
        description="Run registered SEO agents against a website and inspect AgentRun output."
      />
      <DashboardContent>
        {websites.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create a website first, then return here to test agents.
          </p>
        ) : (
          <TestAgentRunner
            websites={websites.map((website) => ({
              id: website.id,
              name: website.name,
              clientName: website.client.name,
            }))}
            agents={agents}
            aiConfigured={isAiConfigured()}
          />
        )}
      </DashboardContent>
    </>
  );
}

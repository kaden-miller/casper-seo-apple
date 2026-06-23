Step 1: Create a Central AI Service

Create a service similar to:

src/lib/ai/ai-service.ts

or use the closest existing project structure.

The AI service should export a function like:

runAgentModel({
  agentName,
  prompt,
  input,
  metadata,
})

The function should:

Load the model config for the requested agent.
Validate that the agent is enabled.
Call the correct AI provider.
Return normalized output.
Log the run to the existing agent_runs table if it exists.
Store provider, model, temperature, max tokens, prompt version, status, and error information.
Step 2: Add Agent Model Config

Create a centralized config file:

src/lib/ai/agent-model-config.ts

Use this structure:

export const agentModelConfig = {
  dataIngestionAgent: {
    provider: "openai",
    model: process.env.DATA_INGESTION_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1-mini",
    temperature: 0.1,
    maxTokens: 2000,
    promptVersion: "v1",
    enabled: true,
  },

  technicalSeoAgent: {
    provider: "openai",
    model: process.env.TECHNICAL_SEO_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.2,
    maxTokens: 4000,
    promptVersion: "v1",
    enabled: true,
  },

  searchPerformanceAgent: {
    provider: "openai",
    model: process.env.SEARCH_PERFORMANCE_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.2,
    maxTokens: 5000,
    promptVersion: "v1",
    enabled: true,
  },

  contentOpportunityAgent: {
    provider: "openai",
    model: process.env.CONTENT_OPPORTUNITY_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.4,
    maxTokens: 6000,
    promptVersion: "v1",
    enabled: true,
  },

  onPageSeoAgent: {
    provider: "openai",
    model: process.env.ON_PAGE_SEO_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.4,
    maxTokens: 6000,
    promptVersion: "v1",
    enabled: true,
  },

  competitiveAnalysisAgent: {
    provider: "openai",
    model: process.env.COMPETITIVE_ANALYSIS_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.3,
    maxTokens: 6000,
    promptVersion: "v1",
    enabled: true,
  },

  prioritizationAgent: {
    provider: "openai",
    model: process.env.PRIORITIZATION_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.2,
    maxTokens: 4000,
    promptVersion: "v1",
    enabled: true,
  },

  qaAgent: {
    provider: "openai",
    model: process.env.QA_AGENT_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.1,
    maxTokens: 5000,
    promptVersion: "v1",
    enabled: true,
  },

  reportingAgent: {
    provider: "openai",
    model: process.env.REPORTING_AGENT_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.3,
    maxTokens: 6000,
    promptVersion: "v1",
    enabled: true,
  },
} as const;

Important: These model names are defaults. The app should prefer environment variables so the model can be changed without editing source code.

Step 3: Add Environment Variables

Update .env.example with:

OPENAI_API_KEY=

DEFAULT_AI_PROVIDER=openai
DEFAULT_AI_MODEL=gpt-4.1

DATA_INGESTION_MODEL=gpt-4.1-mini
TECHNICAL_SEO_MODEL=gpt-4.1
SEARCH_PERFORMANCE_MODEL=gpt-4.1
CONTENT_OPPORTUNITY_MODEL=gpt-4.1
ON_PAGE_SEO_MODEL=gpt-4.1
COMPETITIVE_ANALYSIS_MODEL=gpt-4.1
PRIORITIZATION_MODEL=gpt-4.1
QA_AGENT_MODEL=gpt-4.1
REPORTING_AGENT_MODEL=gpt-4.1

Also update any docs that explain local setup.

Step 4: Refactor Existing Agents

Find all existing agent files.

For each agent:

Remove hardcoded model names.
Remove direct AI provider SDK calls from the agent file.
Keep the agent’s business logic and prompt construction.
Send the final prompt/input to runAgentModel.
Make sure the agent name matches the config key.

Example refactor:

Before:

const completion = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages: [...],
});

After:

const completion = await runAgentModel({
  agentName: "onPageSeoAgent",
  prompt,
  input: {
    page,
    gscData,
    crawlData,
  },
  metadata: {
    clientId,
    pageUrl: page.url,
    taskType: "on_page_recommendation",
  },
});
Step 5: Add Validation

Create a type-safe list of allowed agent names.

Example:

export type AgentName =
  | "dataIngestionAgent"
  | "technicalSeoAgent"
  | "searchPerformanceAgent"
  | "contentOpportunityAgent"
  | "onPageSeoAgent"
  | "competitiveAnalysisAgent"
  | "prioritizationAgent"
  | "qaAgent"
  | "reportingAgent";

The AI service should throw a clear error if an unknown agent name is used.

Step 6: Add Optional Database Table

If Prisma is being used, add a model for future admin-editable config.

Add this only if it fits cleanly with the existing schema.

model AgentModelConfig {
  id            String   @id @default(cuid())
  agentName     String   @unique
  provider      String   @default("openai")
  model         String
  temperature   Float    @default(0.2)
  maxTokens     Int      @default(4000)
  promptVersion String   @default("v1")
  enabled       Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

The app should use this lookup order:

1. Active database config for the agent, if available
2. Environment variable config
3. Static fallback config

If database config is too much for the current phase, implement static config + environment variables now and leave a TODO for database-backed config.

Step 7: Log Agent Model Usage

If the app already has an agent_runs table, update it to store:

agent_name
provider
model
temperature
max_tokens
prompt_version
status
input_summary
output_summary
error_message
started_at
completed_at

If the fields already exist, use them. If they do not exist, add them.

If there is no agent_runs table yet, create one only if it matches the existing architecture.

Step 8: Add Basic Provider Abstraction

For now, implement OpenAI only.

But structure the code so more providers can be added later.

Example:

switch (config.provider) {
  case "openai":
    return runOpenAiModel(config, messages);
  default:
    throw new Error(`Unsupported AI provider: ${config.provider}`);
}

Do not scatter provider-specific logic throughout the agent files.

Step 9: Update README or Internal Docs

Add a section called:

## AI Model Configuration

Explain:

Each agent has its own model configuration.
Defaults live in src/lib/ai/agent-model-config.ts.
Environment variables can override defaults.
Future database-backed configuration is supported.
Agents should never call model providers directly.
Step 10: Acceptance Criteria

This fix is complete when:

No agent file contains a hardcoded model name.
No agent file directly calls the OpenAI SDK or any AI provider SDK.
All agent AI calls go through the centralized AI service.
Each agent has a named model configuration.
.env.example includes default model variables.
Agent runs log the model used.
The app still builds and existing agent workflows still run.
Changing ON_PAGE_SEO_MODEL in .env changes the model used by the On-Page SEO Agent without editing source code.
Important Implementation Notes

Do not rename existing agents unless necessary.

Do not change unrelated business logic.

Do not rebuild the UI unless needed.

Do not remove any existing SEO workflow.

This is a refactor and configuration-layer improvement, not a full rewrite.



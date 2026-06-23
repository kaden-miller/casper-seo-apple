import { readFile } from "fs/promises";
import path from "path";

export async function loadAgentPrompt(promptFile: string): Promise<string> {
  const promptPath = path.join(process.cwd(), "src/lib/agents/prompts", promptFile);
  return readFile(promptPath, "utf8");
}

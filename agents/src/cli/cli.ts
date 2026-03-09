import { Command } from 'commander';
import { CustomAgentConfig } from '@github/copilot-sdk';
import { runCopilotTaskWithPredifinedAgents as runCopilotTaskWithConfiguredAgents } from './copilot';
import * as fs from 'fs';

// Parses the tools file which can be either an array of tool names or an object with a "tools" array. Returns an array of tool names or undefined if no file is provided.
function parseToolsFile(toolsFilePath?: string): string[] | undefined {
  if (!toolsFilePath) {
    return undefined;
  }

  const fileContent = fs.readFileSync(toolsFilePath, 'utf-8');
  const parsed = JSON.parse(fileContent);

  if (Array.isArray(parsed)) {
    return parsed.map((item) => (typeof item === 'string' ? item : item.name));
  }

  if (Array.isArray(parsed.tools)) {
    return parsed.tools.map((item: unknown) =>
      typeof item === 'string' ? item : (item as { name: string }).name
    );
  }

  throw new Error('Invalid tools file format. Expected an array or an object with a tools array.');
}

const program = new Command();

program
  .name('copilot-agents')
  .description('CLI for running tasks with configurable Copilot agents')
  .option('-f, --agent-file <file>', 'Path to JSON file with agent definitions (array or object)')
  .option('-t, --tools-file <file>', 'Path to JSON file with tool definitions')
  .option('-r, --resume <sessionId>', 'Resume a previous session')
  .argument('<task>', 'Task prompt to resolve')
  .action(async (task, options) => {
    let agents: CustomAgentConfig[] = [];
    if (options.agentFile) {
      const fileContent = fs.readFileSync(options.agentFile, 'utf-8');
      const parsed = JSON.parse(fileContent);
      agents = Array.isArray(parsed) ? parsed : [parsed];
    }
    if (agents.length === 0) {
      console.error('No agents specified. Use --agent or --agent-file.');
      process.exit(1);
    }

    let toolNames: string[] | undefined;
    try {
      toolNames = parseToolsFile(options.toolsFile);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error while reading tools file';
      console.error(message);
      process.exit(1);
    }

    const result = await runCopilotTaskWithConfiguredAgents(task, agents, options.resume, toolNames);
    console.log(result);
  });

program.parseAsync(process.argv);

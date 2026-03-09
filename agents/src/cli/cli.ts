import { Command } from 'commander';
import { CustomAgentConfig } from '@github/copilot-sdk';
import { runCopilotTask } from './copilot';
import * as fs from 'fs';

const program = new Command();

program
  .name('copilot-agents')
  .description('CLI for running tasks with configurable Copilot agents')
  .option('-f, --agent-file <file>', 'Path to JSON file with agent definitions (array or object)')
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
    const result = await runCopilotTask(task, agents);
    console.log(result);
  });

program.parseAsync(process.argv);

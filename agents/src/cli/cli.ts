import { Command } from 'commander';
import { CustomAgentConfig } from '@github/copilot-sdk';
import { reportWorkDoneTool, runCopilotTaskWithPredifinedAgents } from './copilot';
import * as fs from 'fs';

const program = new Command();

program
  .name('copilot-agents')
  .description('CLI for running tasks with configurable Copilot agents')
  .option('-f, --agent-file <file>', 'Path to JSON file with agent definitions (array or object)')
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
    // ignore teh passed in file as it's not needed for this demo, and just run with the predefined agent and tool
    const result = await runCopilotTaskWithPredifinedAgents(task, options.resume);
    console.log(result);
  });

program.parseAsync(process.argv);

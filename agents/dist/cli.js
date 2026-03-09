import { Command } from 'commander';
import { CopilotClient } from '@github/copilot-sdk';
import * as fs from 'fs';
const program = new Command();
program
    .name('copilot-agents')
    .description('CLI for running tasks with configurable Copilot agents')
    .option('-a, --agent <agent...>', 'Agent definitions as JSON strings')
    .option('-f, --agent-file <file>', 'Path to JSON file with agent definitions (array or object)')
    .argument('<task>', 'Task prompt to resolve')
    .action(async (task, options) => {
    let agents = [];
    if (options.agentFile) {
        const fileContent = fs.readFileSync(options.agentFile, 'utf-8');
        const parsed = JSON.parse(fileContent);
        agents = Array.isArray(parsed) ? parsed : [parsed];
    }
    if (options.agent) {
        agents = agents.concat((Array.isArray(options.agent) ? options.agent : [options.agent]).map((a) => JSON.parse(a)));
    }
    if (agents.length === 0) {
        console.error('No agents specified. Use --agent or --agent-file.');
        process.exit(1);
    }
    const client = new CopilotClient();
    const session = await client.createSession({
        customAgents: agents,
        model: 'gpt-4.1',
        streaming: true,
        onPermissionRequest: async () => ({ kind: "approved" })
    });
    const response = await session.sendAndWait({ prompt: task });
    console.log(response?.data.content);
    await session.destroy();
    await client.stop();
});
program.parseAsync();

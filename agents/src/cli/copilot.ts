import { CopilotClient, CustomAgentConfig, defineTool } from '@github/copilot-sdk';
import { z } from 'zod';

export async function runCopilotTask(task: string, agents: CustomAgentConfig[]) {
    const client = new CopilotClient();
    const session = await client.createSession({
        customAgents: agents,
        model: 'gpt-4.1',
        streaming: true,
        onPermissionRequest: async () => ({ kind: 'approved' })
    });
    const response = await session.sendAndWait({ prompt: task });
    await session.disconnect();
    await client.stop();
    return response?.data.content;
}

// Agent definition
export const reportingAgent: CustomAgentConfig = {
    name: 'work-reporter',
    displayName: 'Work Reporter',
    description: 'Reports on work completed in the past',
    prompt: 'When asked about recent work, use the tool that reports on the work done in the past',
};

// Run Copilot task with event and tool notifications
export async function runCopilotTaskWithAgents(task: string) {
    const client = new CopilotClient();
    const session = await client.createSession({
        customAgents: [reportingAgent],
        model: 'gpt-4.1',
        streaming: true,
        onPermissionRequest: async () => ({ kind: 'approved' })
    });

    // Subscribe to all events and log them
    const unsubscribe = session.on((event) => {
        switch (event.type) {
            case "subagent.started":
                console.log(`▶ Sub-agent started: ${event.data.agentDisplayName}`);
                console.log(`  Description: ${event.data.agentDescription}`);
                console.log(`  Tool call ID: ${event.data.toolCallId}`);
                break;

            case "subagent.completed":
                console.log(`✅ Sub-agent completed: ${event.data.agentDisplayName}`);
                break;

            case "subagent.failed":
                console.log(`❌ Sub-agent failed: ${event.data.agentDisplayName}`);
                console.log(`  Error: ${event.data.error}`);
                break;

            case "subagent.selected":
                console.log(`🎯 Agent selected: ${event.data.agentDisplayName}`);
                console.log(`  Tools: ${event.data.tools?.join(", ") ?? "all"}`);
                break;

            case "subagent.deselected":
                console.log("↩ Agent deselected, returning to parent");
                break;
        }
    });

    const response = await session.sendAndWait({ prompt: task });

    unsubscribe();
    await session.disconnect();
    await client.stop();
    return response?.data.content;
}

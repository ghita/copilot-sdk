import { CopilotClient, CustomAgentConfig } from '@github/copilot-sdk';
import { resolveTools } from './tools';



// Run Copilot task with event and tool notifications
export async function runCopilotTaskWithPredifinedAgents(
    task: string,
    agents: CustomAgentConfig[],
    resume: string | undefined,
    toolNames?: string[],
) {
    const client = new CopilotClient();
    const tools = resolveTools(toolNames);
    let session;
    if (resume) {
        console.log(`Resuming session with ID: ${resume}`);
        session = await client.resumeSession(resume, { onPermissionRequest: async () => ({ kind: 'approved' }) });
    } else {
        session = await client.createSession({
            customAgents: agents,
            ...(tools ? { tools } : {}),
            // Force a direct custom-tool-only run when debugging tool execution.
            // availableTools: ['report_work_done'],
            excludedTools: ['view', 'edit'],
            // systemMessage: {
            //     mode: 'append',
            //     content: 'For any request, call the report_work_done tool immediately and return its result. Do not gather information or use any other tools.',
            // },
            model: 'gpt-4.1',
            streaming: true,
            onPermissionRequest: async () => ({ kind: 'approved' }),
            hooks: {
                onPostToolUse: (input) => {
                    if (input.toolName === 'joke_tool') {
                        console.log('[hook:onPostToolUse] joke_tool toolResult:', input.toolResult);
                    }
                },
            },
        });
    }

    // Subscribe to all events and log them
    const unsubscribe = session.on((event) => {
        switch (event.type) {
            case "session.start":
                console.log("🚀 Session started:", event.data.sessionId);
                break;
            case "subagent.started":
                console.log(`▶ Sub-agent started: ${event.data.agentDisplayName}`);
                console.log(`  Description: ${event.data.agentDescription}`);
                console.log(`  Tool call ID: ${event.data.toolCallId}`);
                break;

            case "subagent.completed":
                console.log(`✅ Sub-agent completed: ${event.data.agentDisplayName}`);
                console.log(`  Tool call ID: ${event.data.toolCallId}`);
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
            case "tool.execution_start":
                console.log(`🔧 Tool called: ${event.data.toolName}`);
                console.log(`  Parameters: ${event.data.arguments}`);
                break;
            case "tool.execution_complete":
                console.log(`✅ Tool completed (call ID: ${event.data.toolCallId})`);
                console.log(`  Result: ${event.data.result?.detailedContent ?? event.data.result?.content}`);
                break;

        }
    });
    const response = await session.sendAndWait({ prompt: task });
    unsubscribe();
    await session.disconnect();
    await client.stop();
    return response?.data.content;
}

using GitHub.Copilot.SDK;
using Microsoft.Extensions.AI;
using System.ComponentModel;

await using var client = new CopilotClient();
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = "gpt-4.1",
    Streaming = true,
    CustomAgents = new List<CustomAgentConfig>
    {
        new CustomAgentConfig
        {
            Name = "pr-reviewer",
            Description = "Reviews pull requests for best practices and common issues.",
            Prompt = "You are an expert code reviewer. Focus on security, performance, and maintainability "
        }
    },
});

session.On(ev =>
{
    switch (ev)
    {
        case AssistantMessageDeltaEvent deltaEvent:
            Console.Write(deltaEvent.Data.DeltaContent);
            break;
        case SessionIdleEvent:
            Console.WriteLine("\n[Agent is idle]");
            break;
        case SessionErrorEvent errorEvent:
            Console.WriteLine($"[Error]: {errorEvent.Data.Message}");
            break;
        case ToolExecutionStartEvent startEvent:
            Console.WriteLine($"[Tool Start]: {startEvent.Data.ToolName} (ID: {startEvent.Data.ToolCallId})");
            break;
        case ToolExecutionCompleteEvent completeEvent:
            Console.WriteLine($"[Tool End]: Success: {completeEvent.Data.Success}, Result: {completeEvent.Data.Result}");
            break;
    }
});

await session.SendAndWaitAsync(new MessageOptions { Prompt = "Check for git changes in current repo and make a list of possible issues. Look at each file and analyze." });

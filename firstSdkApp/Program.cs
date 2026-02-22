using GitHub.Copilot.SDK;

// non streaming version
// await using var client = new CopilotClient();
// await using var session = await client.CreateSessionAsync(new SessionConfig { Model = "gpt-4.1" });

// var response = await session.SendAndWaitAsync(new MessageOptions { Prompt = "What is 2 + 2?" });
// Console.WriteLine(response?.Data.Content);

await using var client = new CopilotClient();
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = "gpt-4.1",
    Streaming = true,
});

// Subscribe to all events
var unsubscribe = session.On(ev => Console.WriteLine($"Event: {ev.Type}"));

// Listen for response chunks
// session.On(ev =>
// {
//     if (ev is AssistantMessageDeltaEvent deltaEvent)
//     {
//         Console.Write(deltaEvent.Data.DeltaContent);
//     }
//     if (ev is SessionIdleEvent)
//     {
//         Console.WriteLine();
//     }
// });

// Filter by event type using pattern matching
session.On(ev =>
{
    switch (ev)
    {
        case SessionIdleEvent:
            Console.WriteLine("Session is idle");
            break;
        case AssistantMessageDeltaEvent deltaEvent:
            Console.Write(deltaEvent.Data.DeltaContent);
            break;
        case AssistantMessageEvent msg:
            Console.WriteLine($"\nFull Message: {msg.Data.Content}");
            break;
    }
});

// Later, to unsubscribe:
unsubscribe.Dispose();

await session.SendAndWaitAsync(new MessageOptions { Prompt = "Tell me a short joke" });
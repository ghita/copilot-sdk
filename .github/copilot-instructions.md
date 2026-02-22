# Copilot AI Agent Instructions for copilot-sdk

## Overview
This codebase contains multiple sample applications demonstrating integration with the GitHub Copilot SDK for custom agent scenarios. Each app is structured as a standalone .NET console project.

### Major Components
- `customAgentsSdkApp/`, `firstSdkApp/`, `toolCallSdkApp/`: Each folder is a separate .NET app using Copilot SDK.
- Entry point: `Program.cs` in each app folder.
- Custom agent configuration: See `CustomAgents` property in `SessionConfig` (example: `customAgentsSdkApp/Program.cs`).

## Developer Workflow
- **Build:** Run `dotnet build` from the project root after any change. Check for errors and fix before proceeding.
- **Run:** Use `dotnet run` in the desired app folder to start the sample.
- **Git:** Stage, commit, and push changes regularly. Pull latest before new work.

## Patterns & Conventions
- Custom agents are defined via `CustomAgentConfig` objects, specifying `Name`, `Description`, and `Prompt`.
- Session events are handled with `session.On(ev => ...)`, typically printing assistant deltas and idle events.
- Model selection is explicit (e.g., `Model = "gpt-4.1"`).
- Streaming is enabled for real-time output (`Streaming = true`).
- Prompt engineering: Use concise, task-specific prompts in `CustomAgentConfig.Prompt`.

## Integration Points
- Uses `GitHub.Copilot.SDK` and `Microsoft.Extensions.AI` NuGet packages.
- No external service dependencies beyond Copilot SDK.
- CLI executable (`copilot-cli`) is present in build output for win32-x64, but not directly invoked in sample code.

## Example: Custom Agent Setup
```csharp
new CustomAgentConfig {
    Name = "MyCustomAgent",
    Description = "A custom agent for specialized tasks.",
    Prompt = "You are a helpful assistant. Respond concisely and accurately."
}
```

## Key Files
- `customAgentsSdkApp/Program.cs`: Custom agent sample
- `firstSdkApp/Program.cs`: Basic SDK sample
- `toolCallSdkApp/Program.cs`: Tool call sample

## Special Notes
- Always build and check for errors after each change.
- No tests or advanced build scripts are present; focus is on SDK usage.
- No `.github/copilot-instructions.md` previously found; this file is now the canonical guide.

---
If any section is unclear or missing, please provide feedback to improve these instructions.

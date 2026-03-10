One-shot mode (assistant reply on stdout, operational events on stderr):

pnpm start-cli-agent --agent-file ./src/cli/config/agent1.json "Tell me a joke"
pnpm start-cli-agent --agent-file ./src/cli/config/agent1.json --tools-file ./src/cli/config/tools.json "Tell me a joke"

Interactive mode (same-terminal dashboard with separate Events and Conversation sections):

pnpm start-cli-agent --agent-file ./src/cli/config/agent1.json --interactive
pnpm start-cli-agent --agent-file ./src/cli/config/agent1.json --tools-file ./src/cli/config/tools.json --interactive

Disable event visualization (user interaction only):

pnpm start-cli-agent --agent-file ./src/cli/config/agent1.json --interactive --no-visualize-events

Notes:
- Type "exit" in interactive mode to quit.
- In one-shot mode, pass a task argument unless using --interactive.
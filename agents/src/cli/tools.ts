import { defineTool } from '@github/copilot-sdk';
import { z } from 'zod';

export const jokeTool = defineTool('joke_tool', {
  description: 'Returns a short, friendly joke',
  parameters: z.object({}),
  handler: async () => {
    const jokes = [
      "Why did the programmer quit his job? Because he didn't get arrays.",
      "There are only 10 kinds of people in the world: those who understand binary and those who don't.",
      "I would tell you a UDP joke, but you might not get it.",
      'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  },
});

const registeredTools = {
  joke_tool: jokeTool,
};

// Resolves tool names to actual tool definitions, throwing an error if any tool name is not registered
export function resolveTools(toolNames?: string[]) {
  const allTools = Object.values(registeredTools);

  if (!toolNames || toolNames.length === 0) {
    return undefined;
  }

  const selectedTools = toolNames.map((name) => {
    const tool = registeredTools[name as keyof typeof registeredTools];
    if (!tool) {
      throw new Error(`Tool '${name}' is not registered.`);
    }
    return tool;
  });

  return selectedTools.length > 0 ? selectedTools : undefined;
}

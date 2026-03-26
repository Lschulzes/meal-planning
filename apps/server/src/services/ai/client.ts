import Anthropic from "@anthropic-ai/sdk";
import type {
  Tool,
  ToolChoice,
  ToolUseBlock,
} from "@anthropic-ai/sdk/resources/messages/messages";
import { env } from "@meal-planning/env/server";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 8192;

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/**
 * Sends a message to Claude with a tool definition that enforces structured
 * output. The tool's `input_schema` is used to constrain the model's response
 * to match the provided JSON Schema. Returns the parsed tool-call input.
 *
 * Retries once on transient failures.
 *
 * @param systemPrompt - The system-level instruction for Claude.
 * @param userPrompt   - The user-level message.
 * @param toolName     - A short identifier for the tool (e.g. "generate_concepts").
 * @param toolDescription - Human-readable description of what the tool produces.
 * @param inputSchema  - A JSON Schema object (type: "object") that describes the
 *                        expected structured output.
 * @returns The parsed `input` from Claude's tool_use content block.
 */
export async function sendMessage(
  systemPrompt: string,
  userPrompt: string,
  toolName: string,
  toolDescription: string,
  inputSchema: Tool.InputSchema,
): Promise<unknown> {
  const client = getClient();

  const tool: Tool = {
    name: toolName,
    description: toolDescription,
    input_schema: inputSchema,
  };

  const toolChoice: ToolChoice = {
    type: "tool",
    name: toolName,
  };

  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        tools: [tool],
        tool_choice: toolChoice,
      });

      const toolUseBlock = response.content.find(
        (block): block is ToolUseBlock => block.type === "tool_use",
      );

      if (!toolUseBlock) {
        throw new Error(
          `Claude did not return a tool_use block. Stop reason: ${response.stop_reason}`,
        );
      }

      return toolUseBlock.input;
    } catch (error) {
      lastError = error;

      // Only retry once — bail immediately on the second attempt
      if (attempt === 1) {
        break;
      }

      // Do not retry client-side validation errors
      if (error instanceof Error && error.message.includes("did not return")) {
        break;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError));
}

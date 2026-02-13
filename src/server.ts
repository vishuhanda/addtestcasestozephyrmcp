import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parsePrompt } from "./parser.js";
import { ZephyrClient } from "./zephyrClient.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

const zephyr = new ZephyrClient(process.env.ZEPHYR_TOKEN!);

const server = new Server(
  {
    name: "zephyr-prompt-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);


// 🧰 Tool List
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_testcases_from_prompt",
      description: "Parse natural prompt and create Zephyr test cases",
      inputSchema: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Prompt containing project and test cases"
          }
        },
        required: ["prompt"]
      }
    }
  ]
}));


// ⚙️ Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (req) => {

  if (req.params.name !== "create_testcases_from_prompt") {
    throw new Error("Unknown tool");
  }

  const args = req.params.arguments as { prompt?: unknown } | undefined;
  if (!args || typeof args.prompt !== "string") {
    throw new Error("Missing or invalid 'prompt' argument");
  }

  const prompt = args.prompt;

  const parsed = parsePrompt(prompt);

  const results = [];

  for (const tc of parsed.testCases) {
    const created = await zephyr.createTestCase(
      parsed.projectKey,
      tc
    );

    results.push(created.key);
  }

  return {
    content: [
      {
        type: "text",
        text: `Created Test Cases: ${results.join(", ")}`
      }
    ]
  };
});


// 🟢 Start Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();

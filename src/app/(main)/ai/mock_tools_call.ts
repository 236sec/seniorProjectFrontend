import { MyTools } from "@/lib/ai/types";
import { TextUIPart, ToolUIPart, UIMessage, UIMessagePart } from "ai";
import { nanoid } from "nanoid";

type ExtendedState =
  | ToolUIPart["state"]
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-error"
  | "output-denied"
  | "output-available";

export interface ExtendedToolUIPart extends Omit<ToolUIPart, "state"> {
  state: ExtendedState;
}

const tool_call_error: ToolUIPart = {
  type: "tool-api_request" as const,
  toolCallId: nanoid(),
  state: "output-error",
  input: {
    url: "https://api.example.com/data",
    method: "GET",
    headers: {
      Authorization: "Bearer token123",
      "Content-Type": "application/json",
    },
    timeout: 5000,
  },
  output: undefined,
  errorText:
    "Connection timeout: The request took longer than 5000ms to complete. Please check your network connection and try again.",
};

const tool_call_success: ToolUIPart = {
  type: "tool-database_query" as const,
  toolCallId: nanoid(),
  state: "output-available",
  input: {
    query: "SELECT COUNT(*) FROM users WHERE created_at >= ?",
    params: ["2024-01-01"],
    database: "analytics",
  },
  output: [
    {
      "User ID": 1,
      Name: "John Doe",
      Email: "john@example.com",
      "Created At": "2024-01-15",
    },
    {
      "User ID": 2,
      Name: "Jane Smith",
      Email: "jane@example.com",
      "Created At": "2024-01-20",
    },
    {
      "User ID": 3,
      Name: "Bob Wilson",
      Email: "bob@example.com",
      "Created At": "2024-02-01",
    },
    {
      "User ID": 4,
      Name: "Alice Brown",
      Email: "alice@example.com",
      "Created At": "2024-02-10",
    },
    {
      "User ID": 5,
      Name: "Charlie Davis",
      Email: "charlie@example.com",
      "Created At": "2024-02-15",
    },
  ],
  errorText: undefined,
};

const tool_call_running: ToolUIPart = {
  type: "tool-image_generation" as const,
  toolCallId: nanoid(),
  state: "input-available",
  input: {
    prompt: "A futuristic cityscape at sunset with flying cars",
    style: "digital_art",
    resolution: "1024x1024",
    quality: "high",
  },
  output: undefined,
  errorText: undefined,
};

const tool_call_pending: ToolUIPart = {
  type: "tool-web_search" as const,
  toolCallId: nanoid(),
  state: "input-streaming",
  input: {
    query: "latest AI market trends 2024",
    max_results: 10,
    include_snippets: true,
  },
  output: undefined,
  errorText: undefined,
};

const tool_call_approval: ToolUIPart = {
  type: "tool-getLocalTime",
  toolCallId: nanoid(),
  state: "approval-requested",
  input: {
    walletId: "wallet123",
    address: "0xABCDEF1234567890",
    chains: ["ETH_MAINNET", "MATIC_MAINNET"],
  },
  approval: {
    id: nanoid(),
  },
  output: undefined,
};

const tool_call_approved: ToolUIPart = {
  type: "tool-addBlockchainWalletToApp",
  toolCallId: nanoid(),
  state: "output-available",
  input: {
    to: "0x123...",
    amount: "1.5 ETH",
  },
  approval: {
    id: nanoid(),
    approved: true,
    reason: "User confirmed transaction",
  },
  output: { hash: "0xabcdef..." },
};

const tool_call_rejected: ToolUIPart = {
  type: "tool-addManualTransaction",
  toolCallId: nanoid(),
  state: "output-denied",
  input: {
    dbName: "prod-db",
  },
  approval: {
    id: nanoid(),
    approved: false,
    reason: "Too dangerous",
  },
  output: undefined,
};

const normal_message: UIMessagePart<TextUIPart, MyTools> = {
  type: "text",
  text: "This is a normal message without any tool calls.",
};

const tool_call_part: UIMessagePart<ToolUIPart, MyTools> = {
  type: "tool-getApplicationWalletInfo",
  toolCallId: nanoid(),
  state: "output-available",
  input: { id: "wallet123" },
  output: "{balance: '5.0 ETH', tokens: [{symbol: 'ETH', quantity: '5.0'}]}",
  errorText: undefined,
};

export const mockMessages: UIMessage[] = [
  {
    id: nanoid(),
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Here are some mock tool call examples with different states:",
      },
    ],
  },
  {
    id: nanoid(),
    role: "assistant",
    parts: [tool_call_error],
  },
  {
    id: nanoid(),
    role: "assistant",
    parts: [tool_call_success],
  },
  {
    id: nanoid(),
    role: "assistant",
    parts: [tool_call_running],
  },
  {
    id: nanoid(),
    role: "assistant",
    parts: [tool_call_approval],
  },
  {
    id: nanoid(),
    role: "assistant",
    parts: [tool_call_pending],
  },
  {
    id: nanoid(),
    role: "assistant",
    parts: [tool_call_approved],
  },
  {
    id: nanoid(),
    role: "assistant",
    parts: [tool_call_rejected],
  },
  { id: nanoid(), role: "assistant", parts: [tool_call_part, normal_message] },
];

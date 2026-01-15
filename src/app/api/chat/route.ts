import { baseContext } from "@/lib/ai/prompt";
import { tools } from "@/lib/ai/tools";
import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  UIMessage,
} from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const DEFAULT_MODEL = "gemini-2.5-flash";

export async function POST(req: Request) {
  const {
    messages,
    model,
    walletId,
    userId,
  }: {
    messages: UIMessage[];
    model: string;
    walletId?: string;
    userId?: string;
  } = await req.json();
  void model; // currently unused - using DEFAULT_MODEL

  // Build context with user and wallet information
  const contextWithUserInfo = `${baseContext}

Current Context:
- User ID: ${userId || "Not available"}
- Selected Wallet ID: ${walletId || "Not available"}

When using tools that require walletId or userId parameters, use the values provided above unless the user explicitly specifies different ones.`;

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const result = streamText({
        model: google(DEFAULT_MODEL),
        system: contextWithUserInfo,
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(5),
        maxOutputTokens: 1500,
      });

      writer.merge(result.toUIMessageStream({ originalMessages: messages }));
    },
    onFinish: ({}) => {
      // save messages here
      console.log("Finished!");
    },
  });

  return createUIMessageStreamResponse({ stream });
}

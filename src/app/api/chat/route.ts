import { auth } from "@/auth";
import { baseContext } from "@/lib/ai/prompt";
import { createTools } from "@/lib/ai/tools";
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
  const session = await auth();
  const sessionUserId = session?.user?._id;

  if (!sessionUserId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    messages,
    model,
    walletId,
  }: {
    messages: UIMessage[];
    model: string;
    walletId?: string;
  } = await req.json();
  void model; // currently unused - using DEFAULT_MODEL

  // Build context with user and wallet information
  const contextWithUserInfo = `${baseContext}

Current Context:
- User ID: ${sessionUserId}
- Selected Wallet ID: ${walletId || "Not available"}

When using tools that require walletId or userId parameters, use the values provided above unless the user explicitly specifies different ones.`; // userId from body is ignored in favor of verified sessionUserId

  const tools = createTools(sessionUserId);

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const result = streamText({
        model: google(DEFAULT_MODEL),
        system: contextWithUserInfo,
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(5),
        maxOutputTokens: 2000,
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

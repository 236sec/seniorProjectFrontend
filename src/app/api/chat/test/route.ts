import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  simulateReadableStream,
  streamText,
  UIMessage,
} from "ai";
import { MockLanguageModelV3 } from "ai/test";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model: string } =
    await req.json();
  void model; // currently unused - using DEFAULT_MODEL
  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      // Utility function to handle tools that require human confirmation
      // Checks for confirmation in last message and then runs associated tool
      const result = streamText({
        model: new MockLanguageModelV3({
          doStream: async () => ({
            stream: simulateReadableStream({
              chunks: [
                { type: "text-start", id: "text-1" },
                { type: "text-delta", id: "text-1", delta: "Hello" },
                { type: "text-delta", id: "text-1", delta: ", " },
                { type: "text-delta", id: "text-1", delta: "world!" },
                { type: "text-end", id: "text-1" },
                {
                  type: "finish",
                  finishReason: { unified: "stop", raw: undefined },
                  logprobs: undefined,
                  usage: {
                    inputTokens: {
                      total: 3,
                      noCache: 3,
                      cacheRead: undefined,
                      cacheWrite: undefined,
                    },
                    outputTokens: {
                      total: 10,
                      text: 10,
                      reasoning: undefined,
                    },
                  },
                },
              ],
            }),
          }),
        }),
        prompt: "Hello, test!",
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

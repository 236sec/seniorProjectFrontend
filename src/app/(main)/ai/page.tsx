"use client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { tools } from "@/lib/ai/tools";
import { HumanInTheLoopUIMessage, MyTools } from "@/lib/ai/types";
import { APPROVAL, getToolsRequiringConfirmation } from "@/lib/ai/utils";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  getStaticToolName,
  isStaticToolUIPart,
} from "ai";
import { useRef, useState } from "react";

const models = [{ id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" }];

export default function ChatbotPage() {
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>(models[0].id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, addToolOutput, status } =
    useChat<HumanInTheLoopUIMessage>({
      transport: new DefaultChatTransport({
        api: "/api/chat/test",
      }),
    });
  const toolsRequiringConfirmation = getToolsRequiringConfirmation(tools);

  const pendingToolCallConfirmation = messages.some((m) =>
    m.parts?.some(
      (part) =>
        isStaticToolUIPart(part) &&
        part.state === "input-available" &&
        toolsRequiringConfirmation.includes(getStaticToolName(part))
    )
  );

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    if (!hasText) {
      return;
    }
    sendMessage(
      {
        text: message.text,
      },
      {
        body: {
          model: model,
        },
      }
    );
    setText("");
  };
  return (
    <div className="h-full w-full flex flex-col">
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <MessageResponse key={`${message.id}-${i}`}>
                        {part.text}
                      </MessageResponse>
                    );
                  }
                  if (isStaticToolUIPart<MyTools>(part)) {
                    const toolInvocation = part;
                    const toolName = getStaticToolName(toolInvocation);
                    const toolCallId = toolInvocation.toolCallId;
                    const dynamicInfoStyles =
                      "font-mono bg-zinc-100 p-1 text-sm";

                    if (
                      toolsRequiringConfirmation.includes(toolName) &&
                      toolInvocation.state === "input-available"
                    ) {
                      return (
                        <div key={toolCallId}>
                          Run{" "}
                          <span className={dynamicInfoStyles}>{toolName}</span>{" "}
                          with args: <br />
                          <span className={dynamicInfoStyles}>
                            {JSON.stringify(toolInvocation.input, null, 2)}
                          </span>
                          <div className="flex gap-2 pt-2">
                            <button
                              className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                              onClick={async () => {
                                await addToolOutput({
                                  toolCallId,
                                  tool: toolName,
                                  output: APPROVAL.YES,
                                });
                                // trigger new message
                                // can also use sendAutomaticallyWhen on useChat
                                sendMessage();
                              }}
                            >
                              Yes
                            </button>
                            <button
                              className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                              onClick={async () => {
                                await addToolOutput({
                                  toolCallId,
                                  tool: toolName,
                                  output: APPROVAL.NO,
                                });
                                // trigger new message
                                // can also use sendAutomaticallyWhen on useChat
                                sendMessage();
                              }}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      );
                    }
                  }
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput onSubmit={handleSubmit} className="mt-4">
        <PromptInputBody className="w-full">
          <PromptInputTextarea
            className="p-2"
            placeholder="Your Input Here..."
            onChange={(e) => setText(e.target.value)}
            ref={textareaRef}
            value={text}
          />
        </PromptInputBody>
        <PromptInputFooter className="justify-end">
          <PromptInputTools>
            <PromptInputSelect
              onValueChange={(value) => {
                setModel(value);
              }}
              value={model}
            >
              <PromptInputSelectTrigger className="w-40">
                <PromptInputSelectValue className="truncate" />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                {models.map((model) => (
                  <PromptInputSelectItem key={model.id} value={model.id}>
                    {model.name}
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>
          <PromptInputSubmit
            disabled={(!text && !status) || pendingToolCallConfirmation}
            status={status}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}

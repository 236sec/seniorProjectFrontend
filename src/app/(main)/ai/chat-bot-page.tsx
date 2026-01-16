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
import { ToolApproval } from "@/components/ai/approval-tool";
import { GeneralTool } from "@/components/ai/general-tool";
import { WalletDropdown } from "@/components/ai/wallet-dropdown";
import { Spinner } from "@/components/ui/spinner";
import { GetUserResponse } from "@/constants/types/api/getUserTypes";
import { MyTools, MyUIMessage } from "@/lib/ai/types";
import { isApprovalTool } from "@/lib/ai/utils";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  getStaticToolName,
  isStaticToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { useEffect, useRef, useState } from "react";
import { mockMessages } from "./mock_tools_call";

const models = [{ id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" }];

const MOCK_MESSAGES: MyUIMessage[] = mockMessages as MyUIMessage[];
interface ChatbotPageProps {
  userData: GetUserResponse | undefined;
}

export default function ChatbotPage({ userData }: ChatbotPageProps) {
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    userData?.wallets?.[0]?._id || ""
  );
  const [userHaveSubmitted, setUserHaveSubmitted] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>(models[0].id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, addToolApprovalResponse } =
    useChat<MyUIMessage>({
      sendAutomaticallyWhen:
        lastAssistantMessageIsCompleteWithApprovalResponses,
      transport: new DefaultChatTransport({
        api: "/api/chat/test",
      }),
      onError: (error) => {
        console.error("Chat error:", error);
        alert("An error occurred: " + error.message);
      },
    });

  useEffect(() => {
    console.log("Messages updated:", messages);
    console.log("Mock Messages:", MOCK_MESSAGES);
  }, [messages]);

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
          walletId: selectedWalletId,
          userId: userData?._id,
        },
      }
    );
    setText("");
    setUserHaveSubmitted(true);
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
                    const toolName = getStaticToolName(part);
                    if (isApprovalTool(toolName)) {
                      return (
                        <ToolApproval
                          key={`${message.id}-${i}`}
                          part={part}
                          addToolApprovalResponse={addToolApprovalResponse}
                        />
                      );
                    } else {
                      return (
                        <GeneralTool key={`${message.id}-${i}`} part={part} />
                      );
                    }
                  }
                })}
                {status === "submitted" && <Spinner />}
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
          <WalletDropdown
            walletData={userData?.wallets}
            selectedWallet={selectedWalletId}
            setSelectedWallet={setSelectedWalletId}
            disabled={userHaveSubmitted}
          />

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
          <PromptInputSubmit disabled={!text && !status} status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}

"use client";

import { MyTools } from "@/lib/ai/types";
import { getStaticToolName, ToolUIPart } from "ai";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
} from "../ai-elements/confirmation";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "../ai-elements/tool";

interface ToolApprovalProps {
  part: ToolUIPart<MyTools>;
  addToolApprovalResponse: (params: {
    id: string;
    approved: boolean;
    reason?: string;
  }) => void | PromiseLike<void>;
}

export function ToolApproval({
  part,
  addToolApprovalResponse,
}: ToolApprovalProps) {
  const toolInvocation = part;
  const toolName = getStaticToolName<MyTools>(part);
  return (
    <Confirmation
      approval={toolInvocation.approval}
      state={toolInvocation.state}
      key={`${toolInvocation.toolCallId}`}
    >
      <ConfirmationRequest>
        AI is requesting to execute tool: <strong>{toolName.toString()}</strong>
        <br />
        with input:
        <code>{JSON.stringify(toolInvocation.input)}</code>
        <br />
        Do you approve this action?
      </ConfirmationRequest>
      <ConfirmationAccepted>
        <Tool defaultOpen={false}>
          <ToolHeader type={toolInvocation.type} state={toolInvocation.state} />
          <ToolContent>
            <ToolInput input={toolInvocation.input} />
            <ToolOutput
              output={toolInvocation.output}
              errorText={toolInvocation.errorText}
            />
          </ToolContent>
        </Tool>
      </ConfirmationAccepted>
      <ConfirmationRejected>
        <Tool defaultOpen={true}>
          <ToolHeader type={toolInvocation.type} state={toolInvocation.state} />
          <ToolContent>
            <ToolInput input={toolInvocation.input} />
          </ToolContent>
        </Tool>
      </ConfirmationRejected>
      <ConfirmationActions>
        <ConfirmationAction
          variant="outline"
          onClick={() =>
            addToolApprovalResponse({
              id: toolInvocation.approval!.id,
              approved: false,
              reason: "User rejected",
            })
          }
        >
          Reject
        </ConfirmationAction>
        <ConfirmationAction
          variant="default"
          onClick={() =>
            addToolApprovalResponse({
              id: toolInvocation.approval!.id,
              approved: true,
              reason: "User approved",
            })
          }
        >
          Approve
        </ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  );
}

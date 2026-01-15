"use client";

import { MyTools } from "@/lib/ai/types";
import { ToolUIPart } from "ai";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "../ai-elements/tool";

interface GeneralToolProps {
  part: ToolUIPart<MyTools>;
}

export function GeneralTool({ part }: GeneralToolProps) {
  const toolInvocation = part;

  return (
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
  );
}

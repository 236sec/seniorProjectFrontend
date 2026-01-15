import { tools } from "./tools";

// Extract keys of tools that need approval
export const approvalToolNames = Object.entries(tools)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .filter(([_, tool]) => tool.needsApproval === true)
  .map(([name]) => name);

// Helper function
export const isApprovalTool = (toolName: string) =>
  approvalToolNames.includes(toolName);

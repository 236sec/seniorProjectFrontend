"use client";

import { TokenSearchSelect } from "@/components/token-search-select";

export function DashboardTokenSelect() {
  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium mb-2">Search Tokens</label>
      <TokenSearchSelect placeholder="Select a token..." />
    </div>
  );
}

"use client";

import { DropDownToken } from "@/components/drop-down-token";

export function DashboardTokenSelect() {
  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium mb-2">Search Tokens</label>
      <DropDownToken />
    </div>
  );
}

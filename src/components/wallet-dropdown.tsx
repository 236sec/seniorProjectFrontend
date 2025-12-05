"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GetUserResponse } from "@/constants/types/api/getUserTypes";
import { ChevronDown, Wallet } from "lucide-react";

interface WalletDropdownProps {
  walletData: GetUserResponse["wallets"];
  selectedWallet: string | null;
  setSelectedWallet: React.Dispatch<React.SetStateAction<string | null>>;
}

export function WalletDropdown({
  walletData,
  selectedWallet,
  setSelectedWallet,
}: WalletDropdownProps) {
  if (!walletData || walletData.length === 0) {
    return (
      <div className="text-muted-foreground">
        <p>No wallets found</p>
      </div>
    );
  }

  const currentWallet =
    walletData.find((w) => w._id === selectedWallet) || walletData[0];

  return (
    <div className="space-y-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="font-medium">{currentWallet.name}</span>
                <span className="text-xs text-muted-foreground">
                  {currentWallet.description}
                </span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)]"
        >
          {walletData.map((wallet) => (
            <DropdownMenuItem
              key={wallet._id}
              onClick={() => setSelectedWallet(wallet._id)}
              className="flex flex-col items-start py-3 cursor-pointer"
            >
              <span className="font-medium">{wallet.name}</span>
              <span className="text-xs text-muted-foreground">
                {wallet.description}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

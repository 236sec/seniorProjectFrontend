"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getBaseUrl } from "@/env";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

interface AddBlockchainWalletDialogProps {
  walletId: string;
  onWalletAdded?: () => void;
}

const SUPPORTED_CHAINS = [
  { id: "eth-sepolia", label: "Ethereum Sepolia" },
  { id: "opt-mainnet", label: "Optimism Mainnet" },
];

export function AddBlockchainWalletDialog({
  walletId,
  onWalletAdded,
}: AddBlockchainWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [selectedChains, setSelectedChains] = useState<string[]>([]);

  const toggleChain = (chainId: string) => {
    setSelectedChains((prev) =>
      prev.includes(chainId)
        ? prev.filter((id) => id !== chainId)
        : [...prev, chainId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChains.length === 0) {
      alert("Please select at least one chain");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${getBaseUrl()}/api/wallets/blockchain-wallets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletId,
            address,
            chains: selectedChains,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add blockchain wallet");
      }

      setOpen(false);
      // Reset form
      setAddress("");
      setSelectedChains([]);

      if (onWalletAdded) {
        onWalletAdded();
      }
    } catch (error) {
      console.error("Error adding blockchain wallet:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to add blockchain wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Blockchain Wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Blockchain Wallet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="address" className="text-sm font-medium">
              Wallet Address
            </label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              required
              pattern="^0x[a-fA-F0-9]{40}$"
              title="Please enter a valid Ethereum address starting with 0x"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Chains</label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_CHAINS.map((chain) => (
                <div
                  key={chain.id}
                  className={cn(
                    "flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors hover:bg-muted/50",
                    selectedChains.includes(chain.id) &&
                      "border-primary bg-primary/5"
                  )}
                  onClick={() => toggleChain(chain.id)}
                >
                  <span className="text-sm font-medium">{chain.label}</span>
                  {selectedChains.includes(chain.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Wallet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

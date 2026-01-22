"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { GetUserResponse } from "@/constants/types/api/getUserTypes";
import { getBaseUrl } from "@/env";
import { ChevronDown, Plus, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WalletDropdownProps {
  walletData: GetUserResponse["wallets"];
  selectedWallet: string | null;
  onWalletCreated?: () => void;
}

export function WalletDropdown({
  walletData,
  selectedWallet,
  onWalletCreated,
}: WalletDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Wallet name is required");
      return;
    }

    setLoading(true);
    try {
      const payload: { name: string; description?: string } = {
        name: name.trim(),
      };

      if (description.trim()) {
        payload.description = description.trim();
      }

      const response = await fetch(`${getBaseUrl()}/api/wallets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Create wallet error:", errorData);
        throw new Error("Failed to create wallet");
      }

      const data = await response.json();

      // Call the callback first to trigger parent data refetch
      if (onWalletCreated) {
        await onWalletCreated();
      }

      // Then update local state
      // setSelectedWallet(data._id);
      router.push(`/dashboard/${data._id}`);
      setOpen(false);
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Error creating wallet:", error);
      alert("Failed to create wallet");
    } finally {
      setLoading(false);
    }
  };

  if (!walletData || walletData.length === 0) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-center"
            suppressHydrationWarning
          >
            <Plus className="h-4 w-4 mr-2" />
            Add a Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Create New Wallet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="wallet-name" className="text-sm font-medium">
                Wallet Name
              </label>
              <Input
                id="wallet-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Crypto Portfolio"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="wallet-description"
                className="text-sm font-medium"
              >
                Description (Optional)
              </label>
              <Input
                id="wallet-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Track my crypto holdings"
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Wallet"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  const currentWallet =
    walletData.find((w) => w._id === selectedWallet) || walletData[0];

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              suppressHydrationWarning
            >
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
            className="w-(--radix-dropdown-menu-trigger-width)"
          >
            {walletData.map((wallet) => (
              <DropdownMenuItem
                key={wallet._id}
                onClick={() => router.push(`/dashboard/${wallet._id}`)}
                className="flex flex-col items-start py-3 cursor-pointer"
              >
                <span className="font-medium">{wallet.name}</span>
                <span className="text-xs text-muted-foreground">
                  {wallet.description}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {walletData.length < 3 && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setOpen(true);
                }}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Wallet
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Create New Wallet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="wallet-name" className="text-sm font-medium">
                Wallet Name
              </label>
              <Input
                id="wallet-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Crypto Portfolio"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="wallet-description"
                className="text-sm font-medium"
              >
                Description (Optional)
              </label>
              <Input
                id="wallet-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Track my crypto holdings"
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Wallet"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

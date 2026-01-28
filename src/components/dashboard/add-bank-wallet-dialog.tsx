"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addBankWallet } from "@/services/wallets/addBankWallet";
import { useState } from "react";

interface AddBankWalletDialogProps {
  walletId: string;
  onWalletAdded?: () => void;
}

export function AddBankWalletDialog({
  walletId,
  onWalletAdded,
}: AddBankWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await addBankWallet({
        walletId,
        apiKey,
        apiSecret,
      });

      if (!result) {
        throw new Error("Failed to add bank wallet");
      }

      setOpen(false);
      // Reset form
      setApiKey("");
      setApiSecret("");

      if (onWalletAdded) {
        onWalletAdded();
      }
    } catch (error) {
      console.error("Error adding bank wallet:", error);
      alert("Failed to add bank wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Bank Wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Bank Wallet</DialogTitle>
          <DialogDescription>
            Enter your API Key and Secret.{" "}
            <a
              href="https://www.innovestx.co.th/products/product-user-guide/detail/manual/DA-Open-API-Manual"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Get credentials here
            </a>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API Key"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="apiSecret" className="text-sm font-medium">
              API Secret
            </label>
            <Input
              id="apiSecret"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter API Secret"
              required
              type="password"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Wallet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

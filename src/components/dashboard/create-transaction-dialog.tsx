"use client";

import { DropDownToken } from "@/components/drop-down-token";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TransactionEventType,
  TransactionType,
} from "@/constants/types/api/createTransactionTypes";
import { TokenItem } from "@/constants/types/api/getTokensTypes";
import { getBaseUrl } from "@/env";
import { Utils } from "alchemy-sdk";
import { useEffect, useState } from "react";

interface CreateTransactionDialogProps {
  walletId: string;
  onTransactionCreated?: () => void;
}

export function CreateTransactionDialog({
  walletId,
  onTransactionCreated,
}: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState<TransactionEventType>(
    TransactionEventType.DEPOSIT
  );
  const [selectedToken, setSelectedToken] = useState<TokenItem | null>(null);
  const [quantity, setQuantity] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [cashflowUsd, setCashflowUsd] = useState("");

  // Auto-calculate cashflow when quantity or price changes
  useEffect(() => {
    const qty = parseFloat(quantity);
    const price = parseFloat(priceUsd);
    if (!isNaN(qty) && !isNaN(price)) {
      setCashflowUsd((qty * price).toFixed(2));
    } else {
      setCashflowUsd("");
    }
  }, [quantity, priceUsd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) {
      alert("Please select a token");
      return;
    }

    if (!quantity || Number.isNaN(Number(quantity)) || Number(quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    setLoading(true);
    try {
      const hexQuantity = Utils.parseUnits(quantity, 18).toHexString();

      const response = await fetch(`${getBaseUrl()}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletId,
          type: TransactionType.MANUAL,
          tokenId: selectedToken._id,
          event_type: eventType,
          quantity: hexQuantity,
          price_usd: priceUsd ? parseFloat(priceUsd) : undefined,
          cashflow_usd: cashflowUsd ? parseFloat(cashflowUsd) : undefined,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      setOpen(false);
      // Reset form
      setQuantity("");
      setPriceUsd("");
      setCashflowUsd("");
      setSelectedToken(null);

      if (onTransactionCreated) {
        onTransactionCreated();
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Transaction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Manual Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="event-type" className="text-sm font-medium">
              Event Type
            </label>
            <Select
              value={eventType}
              onValueChange={(value) =>
                setEventType(value as TransactionEventType)
              }
            >
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TransactionEventType.DEPOSIT}>
                  Deposit
                </SelectItem>
                <SelectItem value={TransactionEventType.WITHDRAWAL}>
                  Withdrawal
                </SelectItem>
                <SelectItem value={TransactionEventType.SWAP}>Swap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Token</label>
            <DropDownToken onSelect={setSelectedToken} />
          </div>

          <div className="grid gap-2">
            <label htmlFor="quantity" className="text-sm font-medium">
              Quantity
            </label>
            <Input
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="price-usd" className="text-sm font-medium">
              Price (USD)
            </label>
            <Input
              id="price-usd"
              type="number"
              step="any"
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="cashflow-usd" className="text-sm font-medium">
              Cashflow (USD)
            </label>
            <Input
              id="cashflow-usd"
              type="number"
              step="any"
              value={cashflowUsd}
              readOnly
              className="bg-muted"
              placeholder="Auto-calculated"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

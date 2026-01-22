"use client";

import { DropDownToken } from "@/components/drop-down-token";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCondition } from "@/constants/enum/AlertCondition";
import { GetSimplePriceData } from "@/constants/types/api/gecko/getSimplePriceTypes";
import type { TokenItem } from "@/constants/types/api/getTokensTypes";
import { getBaseUrl } from "@/env";
import { formatPrice } from "@/lib/formatters";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function CreateNotificationDialog() {
  const [open, setOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenItem | null>(null);
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [condition, setCondition] = useState<AlertCondition>(
    AlertCondition.ABOVE,
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPrice = async () => {
      if (!selectedToken?.id) {
        setCurrentPrice(null);
        return;
      }

      setIsFetchingPrice(true);
      try {
        const response = await fetch(
          `${getBaseUrl()}/api/coingecko/coins/${selectedToken.id}/price`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch current price");
        }

        const data = (await response.json()) as {
          simplePriceData: GetSimplePriceData;
        };

        if (data && data.simplePriceData[selectedToken.id]) {
          setCurrentPrice(data.simplePriceData[selectedToken.id].usd);
        } else {
          setCurrentPrice(null);
        }
      } catch (error) {
        console.error("Failed to fetch price", error);
        setCurrentPrice(null);
      } finally {
        setIsFetchingPrice(false);
      }
    };

    fetchPrice();
  }, [selectedToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) {
      toast.error("Please select a token");
      return;
    }
    if (!targetPrice) {
      toast.error("Please enter a target price");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        tokenId: selectedToken._id,
        coingeckoId: selectedToken.id,
        targetPrice: parseFloat(targetPrice),
        condition,
      };

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create notification");
      }

      toast.success("Notification created successfully");
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create notification");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedToken(null);
    setTargetPrice("");
    setCondition(AlertCondition.ABOVE);
    setCurrentPrice(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
          <DialogDescription>
            Set a target price for a token. You will be notified when the price
            crosses this threshold.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="token" className="text-right">
              Token
            </Label>
            <div className="col-span-3">
              <DropDownToken onSelect={setSelectedToken} />
              {selectedToken && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center justify-end">
                  {isFetchingPrice ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : currentPrice !== null ? (
                    <span>Current Price: {formatPrice(currentPrice)}</span>
                  ) : (
                    <span>Price unavailable</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="condition" className="text-right">
              Condition
            </Label>
            <Select
              value={condition}
              onValueChange={(val) => setCondition(val as AlertCondition)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AlertCondition.ABOVE}>Above</SelectItem>
                <SelectItem value={AlertCondition.BELOW}>Below</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Target Price
            </Label>
            <Input
              id="price"
              type="number"
              step="any"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="0.00"
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Alert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

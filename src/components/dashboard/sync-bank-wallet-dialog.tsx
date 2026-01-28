"use client";

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
import {
  TransactionEventType,
  TransactionType,
} from "@/constants/types/api/createTransactionTypes";
import { BatchBankTransactionItem } from "@/constants/types/api/transactions/createBatchBankTransactionsTypes";
import { BankWalletDiffDetail } from "@/constants/types/api/wallets/getBankWalletDiffTypes";
import { cn } from "@/lib/utils";
import { createBatchBankTransactions } from "@/services/transactions/createBatchBankTransactions";
import { getBankWalletDiff } from "@/services/wallets/getBankWalletDiff";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

interface SyncBankWalletDialogProps {
  walletId: string;
  bankWalletId: string;
  onSync?: () => void;
  onChangeSubmitting?: () => void;
}

export function SyncBankWalletDialog({
  bankWalletId,
  walletId,
  onSync,
  onChangeSubmitting,
}: SyncBankWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diffDetails, setDiffDetails] = useState<BankWalletDiffDetail[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleFetchDifferences = async () => {
    setLoading(true);
    try {
      const data = await getBankWalletDiff({ bankWalletId });
      if (data) {
        setDiffDetails(data.differences);
        // Select all by default
        setSelectedIndices(data.differences.map((_, i) => i));
      } else {
        throw new Error("Failed to fetch differences");
      }
    } catch (error) {
      console.error("Error fetching bank wallet differences:", error);
      alert("Failed to fetch differences");
    } finally {
      setLoading(false);
    }
  };

  const updateTokenBalanceBankWallet = async () => {
    try {
      const items: BatchBankTransactionItem[] = [];

      for (const i of selectedIndices) {
        const item = diffDetails[i];
        
        // Validation for missing token ID from backend
        if (!item.token?._id) {
           throw new Error(`Missing token ID for ${item.symbol}. The backend response is incomplete.`);
        }

        const oldBal = parseFloat(item.walletBalanceFormatted);
        const newBal = parseFloat(item.balanceFormatted);
        const diff = newBal - oldBal;
        const price = item.currentPrice || 0;

        items.push({
          bankWalletId,
          tokenId: item.token._id,
          type: TransactionType.SYNCED,
          event_type:
            diff > 0
              ? TransactionEventType.DEPOSIT
              : TransactionEventType.WITHDRAWAL,
          quantity: item.balance,
          price_usd: price,
          cashflow_usd: Math.abs(diff) * price,
          timestamp: new Date().toISOString(),
        });
      }

      const success = await createBatchBankTransactions(bankWalletId, {
        walletId,
        items,
      });

      if (!success) {
        throw new Error("Failed to update token balances");
      }
    } catch (error) {
       console.error("Error updating token balances:", error);
       throw error;
    }
  };

  const handleConfirmSync = async () => {
    setLoading(true);
    
    try {
      await updateTokenBalanceBankWallet();

      if (onSync) {
        onSync();
      }

      if (onChangeSubmitting) {
        onChangeSubmitting();
      }

      setOpen(false);
      resetDialog();
    } catch (error) {
      console.error("Error confirming sync:", error);
      alert(error instanceof Error ? error.message : "Failed to sync transactions");
    } finally {
      setLoading(false);
    }
  };
    
  const resetDialog = () => {
    setDiffDetails([]);
    setSelectedIndices([]);
  };

  const toggleSelection = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
            resetDialog();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Sync
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sync Bank Wallet Balances</DialogTitle>
          <DialogDescription>
            Scan for token updates from the bank API.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {diffDetails.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Click below to fetch wallet differences
              </p>
            </div>
          )}

          {diffDetails.length > 0 && (
            <div className="space-y-4">
               <div className="border rounded-md">
                <div className="flex items-center p-2 border-b bg-muted/50">
                  <div className="grid grid-cols-12 flex-1 gap-2 text-xs font-medium text-muted-foreground uppercase">
                    <div className="col-span-1"></div>
                    <div className="col-span-5">Asset</div>
                    <div className="col-span-3 text-right">Old</div>
                    <div className="col-span-3 text-right">New</div>
                  </div>
                </div>
                <div className="h-[300px] overflow-y-auto divide-y">
                  {diffDetails.map((item, index) => {
                      const oldBal = parseFloat(item.walletBalanceFormatted);
                      const newBal = parseFloat(item.balanceFormatted);
                      const diff = newBal - oldBal;
                      return (
                        <div key={index} className="flex items-center p-2">
                             <input
                                type="checkbox"
                                checked={selectedIndices.includes(index)}
                                onChange={() => toggleSelection(index)}
                                className="mr-3 h-4 w-4 col-span-1"
                              />
                            <div className="grid grid-cols-11 flex-1 gap-2 items-center">
                                <div className="col-span-5 flex items-center gap-2">
                                     {/* eslint-disable-next-line @next/next/no-img-element */}
                                     {item.logo && <img src={item.logo} alt={item.symbol} className="w-5 h-5 rounded-full" />}
                                     <div className="flex flex-col">
                                         <span className="text-sm font-medium">{item.symbol}</span>
                                         <span className="text-xs text-muted-foreground">{item.network}</span>
                                     </div>
                                </div>
                                <div className="col-span-3 text-right text-sm">{oldBal.toFixed(4)}</div>
                                <div className="col-span-3 text-right text-sm">
                                    <div>{newBal.toFixed(4)}</div>
                                    {Math.abs(diff) > 0 && (
                                        <div className={cn("text-[10px]", diff > 0 ? "text-green-600" : "text-red-600")}>
                                            {diff > 0 ? "+" : ""}{diff.toFixed(4)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                      );
                  })}
                </div>
               </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleFetchDifferences}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Fetch Differences
          </Button>
          {diffDetails.length > 0 && (
            <Button onClick={handleConfirmSync} disabled={selectedIndices.length === 0}>
              Confirm Updates
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

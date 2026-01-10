"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  AlchemyChain,
  AVAILABLE_CHAINS,
  CHAIN_DISPLAY_NAMES,
} from "@/constants/enum/AlchemyChain";
import {
  GetBlockchainWalletDiffResponse,
  TokenMetadata,
} from "@/constants/types/api/wallets/getBlockchainWalletDiffTypes";
import { getBaseUrl } from "@/env";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

interface SyncBlockchainWalletDialogProps {
  blockchainWalletId: string;
  initChains?: AlchemyChain[];
  onSync?: (selectedTokens: ScannedToken[]) => void;
}

interface ScannedToken {
  name: string;
  symbol: string;
  network: string;
  balance: number;
  logo: string;
  contractAddress: string;
  oldBalance: number;
  diff: number;
  formattedBalance: string;
  decimals: number | null;
  token: TokenMetadata | null;
}

export function SyncBlockchainWalletDialog({
  blockchainWalletId,
  initChains = [],
  onSync,
}: SyncBlockchainWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedTokens, setScannedTokens] = useState<ScannedToken[]>([]);
  const [selectedTokenIndices, setSelectedTokenIndices] = useState<number[]>(
    []
  );
  const [uncheckedChains, setUncheckedChains] =
    useState<AlchemyChain[]>(initChains);
  const [address, setAddress] = useState<string>("");
  const [selectedChains, setSelectedChains] =
    useState<AlchemyChain[]>(initChains);
  const [chainSelectorOpen, setChainSelectorOpen] = useState(false);

  const updateBlockchainWalletChains = async () => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/api/wallets/blockchainWallets/${blockchainWalletId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chains: selectedChains }),
        }
      );
      setUncheckedChains(selectedChains);

      if (!response.ok) {
        throw new Error("Failed to update blockchain wallet");
      } else {
      }
    } catch (error) {
      console.error("Error updating blockchain wallet:", error);
      throw error;
    }
  };

  const handleFetchDifferences = async () => {
    setLoading(true);
    try {
      // First, update the blockchain wallet with selected chains
      await updateBlockchainWalletChains();

      // Then fetch the differences
      const response = await fetch(
        `${getBaseUrl()}/api/wallets/blockchainWallets/${blockchainWalletId}/diff`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wallet differences");
      }

      const data: GetBlockchainWalletDiffResponse = await response.json();
      setAddress(data.address);

      const tokens: ScannedToken[] = data.differences.map((diff) => {
        const currentBalance = parseFloat(diff.balanceFormatted);
        const previousBalance = parseFloat(diff.walletBalanceFormatted);
        const difference = currentBalance - previousBalance;

        return {
          name: diff.name,
          symbol: diff.symbol,
          network: diff.network,
          balance: currentBalance,
          contractAddress: diff.contractAddress,
          oldBalance: previousBalance,
          diff: difference,
          formattedBalance: diff.balanceFormatted,
          decimals: diff.decimals,
          logo: diff.logo || diff.token?.image?.thumb || "",
          token: diff.token,
        };
      });

      setScannedTokens(tokens);
      // Default select all tokens where there is a difference
      const indicesToSelect = tokens
        .map((t, i) => (Math.abs(t.diff) > 0 ? i : -1))
        .filter((i) => i !== -1);
      setSelectedTokenIndices(indicesToSelect);
    } catch (error) {
      console.error("Error fetching wallet differences:", error);
      alert("Failed to fetch wallet differences");
    } finally {
      setLoading(false);
    }
  };

  const toggleTokenSelection = (index: number) => {
    setSelectedTokenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleAllTokens = (checked: boolean) => {
    setSelectedTokenIndices(checked ? scannedTokens.map((_, i) => i) : []);
  };

  const toggleChain = (chain: AlchemyChain) => {
    // If it's an initial chain, don't allow unchecking
    if (uncheckedChains.includes(chain)) {
      return;
    }

    setSelectedChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain]
    );
  };

  const handleConfirmSync = () => {
    const tokensToSync = selectedTokenIndices.map((i) => scannedTokens[i]);
    console.log("Syncing tokens:", tokensToSync);

    // In a real implementation, this would call an API to update the wallet's holdings
    if (onSync) {
      onSync(tokensToSync);
    }
    setOpen(false);
  };

  const resetDialog = () => {
    setScannedTokens([]);
    setSelectedTokenIndices([]);
    setAddress("");
    // setSelectedChains([]);
    // setUncheckedChains([]);
    setChainSelectorOpen(true);
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
          Sync Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sync Wallet Balances</DialogTitle>
          <DialogDescription>
            {address ? (
              <>
                Scan for token updates on {address.slice(0, 6)}...
                {address.slice(-4)}
              </>
            ) : (
              "Fetching wallet data..."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {scannedTokens.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Select chains and click below to fetch wallet differences
              </p>
            </div>
          )}

          <Collapsible
            open={chainSelectorOpen}
            onOpenChange={setChainSelectorOpen}
          >
            <div className="space-y-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between p-2 hover:bg-muted/50"
                >
                  <span className="text-sm font-medium">
                    Select Chains ({selectedChains.length})
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      chainSelectorOpen && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {AVAILABLE_CHAINS.map((chain) => {
                    const isInitial = initChains.includes(chain);
                    const isSelected = selectedChains.includes(chain);
                    return (
                      <div
                        key={chain}
                        className={cn(
                          "flex items-center justify-between rounded-md border p-3 transition-colors",
                          isSelected && "border-primary bg-primary/5",
                          isInitial
                            ? "opacity-75"
                            : "cursor-pointer hover:bg-muted/50"
                        )}
                        onClick={() => !isInitial && toggleChain(chain)}
                        title={
                          isInitial ? "Initial chain - cannot be removed" : ""
                        }
                      >
                        <span className="text-sm font-medium">
                          {CHAIN_DISPLAY_NAMES[chain]}
                        </span>
                        <div className="flex items-center gap-1">
                          {isInitial && (
                            <span className="text-[10px] text-muted-foreground">
                              Synced
                            </span>
                          )}
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {scannedTokens.length > 0 && (
            <div className="space-y-4">
              <div className="border rounded-md">
                <div className="flex items-center p-2 border-b bg-muted/50">
                  <input
                    type="checkbox"
                    checked={
                      scannedTokens.length > 0 &&
                      selectedTokenIndices.length === scannedTokens.length
                    }
                    onChange={(e) => toggleAllTokens(e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div className="grid grid-cols-12 flex-1 gap-2 text-xs font-medium text-muted-foreground uppercase">
                    <div className="col-span-5">Asset</div>
                    <div className="col-span-3 text-right">Old</div>
                    <div className="col-span-4 text-right">New</div>
                  </div>
                </div>
                <div className="h-[300px] overflow-y-auto">
                  {scannedTokens.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No tokens found.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {scannedTokens.map((token, index) => (
                        <div
                          key={`${token.symbol}-${token.network}-${index}`}
                          className={cn(
                            "flex items-center p-2 hover:bg-muted/30 transition-colors",
                            selectedTokenIndices.includes(index) &&
                              "bg-primary/5"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTokenIndices.includes(index)}
                            onChange={() => toggleTokenSelection(index)}
                            className="mr-3 mt-1 self-start h-4 w-4"
                          />
                          <div className="grid grid-cols-12 flex-1 gap-2 items-center">
                            <div className="col-span-5">
                              <div className="flex items-center gap-2">
                                {token.logo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={token.logo}
                                    alt={token.symbol}
                                    className="h-6 w-6 rounded-full shrink-0"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                    {token.symbol.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-sm font-medium truncate">
                                    {token.symbol.toUpperCase()}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="w-fit text-[10px] h-4 px-1 font-normal"
                                  >
                                    {token.network}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-3 text-right text-sm text-muted-foreground">
                              {token.oldBalance > 0
                                ? token.oldBalance.toLocaleString(undefined, {
                                    maximumFractionDigits: 4,
                                  })
                                : "-"}
                            </div>
                            <div className="col-span-4 text-right">
                              <div className="text-sm font-medium">
                                {token.balance.toLocaleString(undefined, {
                                  maximumFractionDigits: 4,
                                })}
                              </div>
                              {Math.abs(token.diff) > 0.000001 && (
                                <span
                                  className={cn(
                                    "text-[10px]",
                                    token.diff > 0
                                      ? "text-green-600"
                                      : "text-red-500"
                                  )}
                                >
                                  {token.diff > 0 ? "+" : ""}
                                  {token.diff.toLocaleString(undefined, {
                                    maximumFractionDigits: 4,
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleFetchDifferences}
            disabled={
              loading || scannedTokens.length > 0 || selectedChains.length === 0
            }
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {scannedTokens.length > 0
              ? "Differences Loaded"
              : "Fetch Differences"}
          </Button>
          {scannedTokens.length > 0 && (
            <Button
              onClick={handleConfirmSync}
              disabled={selectedTokenIndices.length === 0}
            >
              Confirm Updates ({selectedTokenIndices.length})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

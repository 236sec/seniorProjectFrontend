"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  AlchemyChain,
  AVAILABLE_CHAINS,
  CHAIN_DISPLAY_NAMES,
} from "@/constants/enum/AlchemyChain";
import { RpcChain } from "@/constants/enum/RpcChain";
import { GetAddressBalancesResponse } from "@/constants/types/api/alchemy/getAddressBalancesTypes";
import { getBaseUrl } from "@/env";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { TokenRow } from "./token-row";

type SelectableChain = AlchemyChain | RpcChain;

export function AddressBalanceChecker() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GetAddressBalancesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedChains, setSelectedChains] = useState<SelectableChain[]>([
    AlchemyChain.ETHEREUM_SEPOLIA,
    AlchemyChain.OP_MAINNET,
  ]);
  const [isChainSelectorOpen, setIsChainSelectorOpen] = useState(false);

  const toggleChain = (chain: SelectableChain) => {
    setSelectedChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  };

  const toggleAllChains = (checked: boolean) => {
    setSelectedChains(checked ? [...AVAILABLE_CHAINS] : []);
  };

  const handleSearch = async () => {
    if (!address || selectedChains.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Basic validation or let backend handle it
      if (!address.startsWith("0x") || address.length !== 42) {
        throw new Error("Invalid Ethereum address format");
      }

      const chainsParam = selectedChains.join(",");
      const response = await fetch(
        `${getBaseUrl()}/api/alchemy/balances/${address}?chains=${chainsParam}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch balances with url: ${getBaseUrl()}/api/alchemy/balances/${address}`,
        );
      }

      const data: GetAddressBalancesResponse = await response.json();
      const filterd_data = data.balances.filter(
        (token) => token.token !== null,
      );
      setResult({
        ...data,
        balances: filterd_data,
        totalTokens: filterd_data.length,
        tokensWithMetadata: filterd_data.filter((token) => token.token).length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-lg font-semibold leading-none tracking-tight">
          Wallet Inspector
        </h3>
        <p className="text-sm text-muted-foreground">
          Check balances for any customized Ethereum address
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={loading || !address || selectedChains.length === 0}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="sr-only">Search</span>
          </Button>
        </div>

        <Collapsible
          open={isChainSelectorOpen}
          onOpenChange={setIsChainSelectorOpen}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={loading}
            >
              <span className="text-sm">
                {selectedChains.length === 0
                  ? "Select chains"
                  : `${selectedChains.length} chain${
                      selectedChains.length !== 1 ? "s" : ""
                    } selected`}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isChainSelectorOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="border rounded-md p-3 space-y-3 bg-muted/30">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedChains.length === AVAILABLE_CHAINS.length}
                  onChange={(e) => toggleAllChains(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Select All
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {AVAILABLE_CHAINS.map((chain) => (
                  <div key={chain} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={chain}
                      checked={selectedChains.includes(chain)}
                      onChange={() => toggleChain(chain)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={chain}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {CHAIN_DISPLAY_NAMES[chain]}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {error && (
        <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Native Balances */}
          {result.nativeBalances && result.nativeBalances.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Native Balances</h4>
              <div className="grid grid-cols-1 gap-2">
                {result.nativeBalances.map((native) => (
                  <TokenRow key={native.network} data={native} />
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground font-medium uppercase">
                Total Tokens
              </p>
              <p className="text-xl font-bold">{result.totalTokens}</p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground font-medium uppercase">
                With Metadata
              </p>
              <p className="text-xl font-bold">{result.tokensWithMetadata}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Token Holdings</h4>
            {result.balances.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tokens found.</p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {result.balances.map((token, index) => (
                  <TokenRow
                    key={`${token.contractAddress}-${token.network}-${index}`}
                    data={token}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

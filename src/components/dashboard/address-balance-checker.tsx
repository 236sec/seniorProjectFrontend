"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/env";
import { AddressBalancesResponse } from "@/services/alchemy/getBalances";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";

export function AddressBalanceChecker() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AddressBalancesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Basic validation or let backend handle it
      if (!address.startsWith("0x") || address.length !== 42) {
        throw new Error("Invalid Ethereum address format");
      }

      const response = await fetch(
        `${env.NEXT_PUBLIC_FRONTEND_URL}/api/alchemy/balances/${address}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch balances");
      }

      const data: AddressBalancesResponse = await response.json();
      setResult(data);
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

      <div className="flex gap-2">
        <Input
          placeholder="0x..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading || !address}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="sr-only">Search</span>
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Native Balances by Network */}
          {result.nativeBalances.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Native Balances</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.nativeBalances.map((native) => (
                  <div key={native.network} className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      {native.network}
                    </p>
                    <p className="text-lg font-bold">
                      {parseFloat(native.balance).toFixed(4)} ETH
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground font-medium uppercase">
              Token Count
            </p>
            <p className="text-xl font-bold">{result.tokenBalances.length}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Token Holdings</h4>
            {result.tokenBalances.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tokens found.</p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {result.tokenBalances.map((token, index) => (
                  <div
                    key={`${token.contractAddress}-${token.network}-${index}`}
                    className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md border text-sm transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {token.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={token.logo}
                          alt={token.symbol}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                          {token.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{token.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded">
                            {token.network}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {token.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">
                        {parseFloat(token.balance).toLocaleString(undefined, {
                          maximumFractionDigits: 4,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

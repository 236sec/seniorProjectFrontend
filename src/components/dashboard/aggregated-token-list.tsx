import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AggregatedToken,
  formatBalance,
  formatPercentage,
} from "@/lib/portfolio-utils";
import { Utils } from "alchemy-sdk";
import { ChevronRight } from "lucide-react";

interface AggregatedTokenListProps {
  tokens: AggregatedToken[];
}

export function AggregatedTokenList({ tokens }: AggregatedTokenListProps) {
  return (
    <div className="space-y-2 overflow-hidden">
      <div className="grid grid-cols-[1fr_100px_150px] px-4 text-sm font-medium text-muted-foreground">
        <div>Asset</div>
        <div>Symbol</div>
        <div className="text-right">Total Balance</div>
      </div>
      <div className="space-y-2">
        {tokens.map((token) => (
          <Collapsible key={token.id}>
            <div className="rounded-md border bg-card">
              <CollapsibleTrigger className="flex w-full items-center p-4 hover:bg-muted/50 [&[data-state=open]>div>div>svg]:rotate-90">
                <div className="grid w-full grid-cols-[1fr_100px_150px] items-center">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={token.image} alt={token.name} />
                      <AvatarFallback>
                        {token.symbol.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{token.name}</span>
                  </div>
                  <div className="text-left uppercase text-muted-foreground">
                    {token.symbol.length > 5
                      ? token.symbol.slice(0, 5) + "..."
                      : token.symbol}
                  </div>
                  <div>
                    <div className="font-mono text-sm truncate">
                      {Utils.formatUnits(token.totalBalance.toString(), 18)}
                    </div>
                    <div
                      className={`font-mono text-sm ${
                        token.pnlPercentage >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatPercentage(token.pnlPercentage)}
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t bg-muted/5 p-4 space-y-2">
                  {token.portfolioPerformance && (
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Current Price:
                        </span>
                        <span className="font-mono font-medium">
                          $
                          {token.currentPrice?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          24h Change:
                        </span>
                        <span
                          className={`font-mono font-medium ${
                            token.priceChange24h &&
                            token.priceChange24h !== null &&
                            token.priceChange24h >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {token.priceChange24h &&
                          token.priceChange24h !== null &&
                          token.priceChange24h >= 0
                            ? "+"
                            : ""}
                          {token.priceChange24h !== null
                            ? token.priceChange24h?.toFixed(2)
                            : "N/A"}
                          %
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Current Value:
                        </span>
                        <span className="font-mono font-medium">
                          $
                          {token.currentValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Total Invested:
                        </span>
                        <span className="font-mono font-medium">
                          $
                          {token.portfolioPerformance.totalInvestedAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">PNL:</span>
                        <span
                          className={`font-mono font-medium ${
                            token.pnlAmount >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatPercentage(token.pnlPercentage)} (
                          {token.pnlAmount >= 0 ? "+" : ""}$
                          {token.pnlAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          )
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Total Cashflow:
                        </span>
                        <span className="font-mono font-medium">
                          $
                          {token.portfolioPerformance.totalCashflowUsd.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="font-mono font-medium">
                          {formatBalance(
                            token.portfolioPerformance.totalBalance,
                          )}{" "}
                          {token.symbol.length > 5
                            ? token.symbol.slice(0, 5).toUpperCase() + "..."
                            : token.symbol.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
        {tokens.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No assets found in this portfolio.
          </div>
        )}
      </div>
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GetWalletResponse,
  ManualTokenBalance,
} from "@/constants/types/api/getWalletTypes";
import {
  calculatePortfolioSummary,
  formatBalance,
  formatPercentage,
  getAggregatedTokens,
} from "@/lib/portfolio-utils";
import { Utils } from "alchemy-sdk";
import { ChevronRight, RefreshCw } from "lucide-react";
import { AddBlockchainWalletDialog } from "./add-blockchain-wallet-dialog";
import { CreateTransactionDialog } from "./create-transaction-dialog";

interface WalletDisplayProps {
  walletData: GetWalletResponse | null;
  loading?: boolean;
  refreshWalletData: () => void;
}

function TokenTable({
  tokens,
  tokensMap,
}: {
  tokens: ManualTokenBalance[];
  tokensMap: GetWalletResponse["tokens"];
}) {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">No tokens found.</div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.map((token, index) => {
          const details = tokensMap[token.tokenId];
          if (!details) return null;

          return (
            <TableRow key={details._id || index}>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={details.image?.small} alt={details.name} />
                  <AvatarFallback>
                    {details.symbol.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{details.name}</span>
              </TableCell>
              <TableCell className="uppercase text-muted-foreground">
                {details.symbol}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatBalance(token.balance)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function WalletDisplay({
  walletData,
  loading = false,
  refreshWalletData,
}: WalletDisplayProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!walletData) return null;

  const aggregatedTokens = getAggregatedTokens(walletData);
  const portfolioSummary = calculatePortfolioSummary(aggregatedTokens);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {walletData.wallet.name}
        </h2>
        <p className="text-muted-foreground">{walletData.wallet.description}</p>
      </div>

      <div className="grid gap-6">
        {/* Portfolio Summary Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Total Portfolio Balance</CardTitle>
            <CardDescription>
              Aggregated holdings across all wallets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Portfolio Summary Stats */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">
                  Total Value
                </span>
                <span className="text-2xl font-bold">
                  $
                  {portfolioSummary.totalCurrentValue.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Total PNL</span>
                <span
                  className={`text-2xl font-bold ${
                    portfolioSummary.totalPnlPercentage >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatPercentage(portfolioSummary.totalPnlPercentage)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {portfolioSummary.totalPnlAmount >= 0 ? "+" : ""}$
                  {portfolioSummary.totalPnlAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">
                  24h Change
                </span>
                <span
                  className={`text-2xl font-bold ${
                    portfolioSummary.weighted24hChange >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {portfolioSummary.weighted24hChange >= 0 ? "+" : ""}
                  {portfolioSummary.weighted24hChange.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_100px_150px] px-4 text-sm font-medium text-muted-foreground">
                <div>Asset</div>
                <div>Symbol</div>
                <div className="text-right">Total Balance</div>
              </div>
              <div className="space-y-2">
                {aggregatedTokens.map((token) => (
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
                            {token.symbol}
                          </div>
                          <div className="text-right font-mono font-bold">
                            {Utils.formatUnits(
                              token.totalBalance.toString(),
                              18
                            )}
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
                                  {token.currentPrice.toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  24h Change:
                                </span>
                                <span
                                  className={`font-mono font-medium ${
                                    token.priceChange24h !== null &&
                                    token.priceChange24h >= 0
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {token.priceChange24h !== null &&
                                  token.priceChange24h >= 0
                                    ? "+"
                                    : ""}
                                  {token.priceChange24h !== null
                                    ? token.priceChange24h.toFixed(2)
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
                                  {token.currentValue.toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
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
                                <span className="text-muted-foreground">
                                  PNL:
                                </span>
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
                                <span className="text-muted-foreground">
                                  Balance:
                                </span>
                                <span className="font-mono">
                                  {formatBalance(
                                    token.portfolioPerformance.totalBalance
                                  )}{" "}
                                  {token.symbol.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
                {aggregatedTokens.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No assets found in this portfolio.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <CreateTransactionDialog
          walletId={walletData.wallet._id}
          onTransactionCreated={refreshWalletData}
        />

        {/* Blockchain Wallets Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Connected Wallets</h3>
          {walletData.wallet.blockchainWalletId.map((wallet) => (
            <Card key={wallet._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-mono text-base">
                      {wallet.address}
                    </CardTitle>
                    <CardDescription>
                      Added on {new Date(wallet.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {wallet.chains.map((chain) => (
                      <Badge key={chain} variant="secondary">
                        {chain}
                      </Badge>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Mock sync functionality
                        console.log("Syncing wallet:", wallet.address);
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  No on-chain tokens tracked. Use manual balances to add
                  holdings.
                </div>
              </CardContent>
            </Card>
          ))}
          {walletData.wallet.blockchainWalletId.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No blockchain wallets connected.
            </div>
          )}
          <AddBlockchainWalletDialog
            walletId={walletData.wallet._id}
            onWalletAdded={refreshWalletData}
          />
        </div>

        {/* Manual Tokens Section */}
        {walletData.wallet.manualTokens.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Manual Holdings</h3>
            <Card>
              <CardHeader>
                <CardTitle>Manually Added Assets</CardTitle>
                <CardDescription>
                  Assets you&apos;ve manually tracked in this portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TokenTable
                  tokens={walletData.wallet.manualTokens}
                  tokensMap={walletData.tokens}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

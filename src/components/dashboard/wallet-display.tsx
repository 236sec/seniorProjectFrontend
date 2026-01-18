import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GetWalletResponse } from "@/constants/types/api/getWalletTypes";
import {
  calculatePortfolioSummary,
  getAggregatedTokens,
} from "@/lib/portfolio-utils";
import { AggregatedTokenList } from "./aggregated-token-list";
import { BlockchainWalletList } from "./blockchain-wallet-list";
import { CreateTransactionDialog } from "./create-transaction-dialog";
import { ManualHoldingsList } from "./manual-holdings-list";
import { PortfolioStats } from "./portfolio-summary";
import { TokenAllocationPieChart } from "./token-allocation-pie-chart";

interface WalletDisplayProps {
  walletData: GetWalletResponse | null;
  loading?: boolean;
  refreshWalletData: () => void;
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
          <Skeleton className="h-75 w-full" />
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
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <PortfolioStats summary={portfolioSummary} />
              </div>
              <div className="flex-1">
                <TokenAllocationPieChart tokens={aggregatedTokens} />
              </div>
            </div>
            <AggregatedTokenList tokens={aggregatedTokens} />
          </CardContent>
        </Card>

        {/* Blockchain Wallets Section */}
        <BlockchainWalletList
          wallets={walletData.wallet.blockchainWalletId}
          walletId={walletData.wallet._id}
          tokensMap={walletData.tokens}
          refreshWalletData={refreshWalletData}
        />

        {/* Manual Tokens Section */}
        <ManualHoldingsList
          tokens={walletData.wallet.manualTokens}
          tokensMap={walletData.tokens}
        />

        <CreateTransactionDialog
          walletId={walletData.wallet._id}
          onTransactionCreated={refreshWalletData}
        />
      </div>
    </div>
  );
}

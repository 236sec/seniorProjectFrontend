import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  TokenBalance,
} from "@/constants/types/api/getWalletTypes";
import { Utils } from "alchemy-sdk";

interface WalletDisplayProps {
  walletData: GetWalletResponse;
}

function formatBalance(balance: string): string {
  try {
    // Check if it's a hex string
    if (balance.startsWith("0x")) {
      // Assuming 18 decimals for now as we don't have it in the type
      return Utils.formatUnits(balance, 18);
    }
    return balance;
  } catch (e) {
    void e;
    return balance;
  }
}

interface AggregatedToken {
  id: string;
  name: string;
  symbol: string;
  image: string;
  totalBalance: bigint;
}

function getTokenDetails(token: TokenBalance | ManualTokenBalance) {
  if ("tokenContractId" in token) {
    return token.tokenContractId.tokenId;
  }
  return token.tokenId;
}

function getAggregatedTokens(walletData: GetWalletResponse): AggregatedToken[] {
  const tokenMap = new Map<string, AggregatedToken>();

  const processToken = (token: TokenBalance | ManualTokenBalance) => {
    const tokenDetails = getTokenDetails(token);
    const currentBalance = BigInt(token.balance);

    if (tokenMap.has(tokenDetails.id)) {
      const existing = tokenMap.get(tokenDetails.id)!;
      existing.totalBalance += currentBalance;
    } else {
      tokenMap.set(tokenDetails.id, {
        id: tokenDetails.id,
        name: tokenDetails.name,
        symbol: tokenDetails.symbol,
        image: tokenDetails.image.small,
        totalBalance: currentBalance,
      });
    }
  };

  // Process blockchain wallets
  walletData.blockchainWalletId.forEach((wallet) => {
    wallet.tokens.forEach(processToken);
  });

  // Process manual tokens
  walletData.manualTokens.forEach(processToken);

  return Array.from(tokenMap.values());
}

function TokenTable({
  tokens,
}: {
  tokens: (TokenBalance | ManualTokenBalance)[];
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
          const details = getTokenDetails(token);
          return (
            <TableRow key={details._id || index}>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={details.image.small} alt={details.name} />
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

export function WalletDisplay({ walletData }: WalletDisplayProps) {
  const aggregatedTokens = getAggregatedTokens(walletData);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{walletData.name}</h2>
        <p className="text-muted-foreground">{walletData.description}</p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Total Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregatedTokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={token.image} alt={token.name} />
                        <AvatarFallback>
                          {token.symbol.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{token.name}</span>
                    </TableCell>
                    <TableCell className="uppercase text-muted-foreground">
                      {token.symbol}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {Utils.formatUnits(token.totalBalance.toString(), 18)}
                    </TableCell>
                  </TableRow>
                ))}
                {aggregatedTokens.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      No assets found in this portfolio.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Blockchain Wallets Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Connected Wallets</h3>
          {walletData.blockchainWalletId.map((wallet) => (
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
                  <div className="flex gap-2">
                    {wallet.chains.map((chain) => (
                      <Badge key={chain} variant="secondary">
                        {chain}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TokenTable tokens={wallet.tokens} />
              </CardContent>
            </Card>
          ))}
          {walletData.blockchainWalletId.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No blockchain wallets connected.
            </div>
          )}
        </div>

        {/* Manual Tokens Section */}
        {walletData.manualTokens.length > 0 && (
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
                <TokenTable tokens={walletData.manualTokens} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

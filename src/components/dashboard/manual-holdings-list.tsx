import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/constants/types/api/getWalletTypes";
import { formatBalance } from "@/lib/portfolio-utils";

interface ManualHoldingsListProps {
  tokens: ManualTokenBalance[];
  tokensMap: GetWalletResponse["tokens"];
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
                {details.symbol.length > 5
                  ? details.symbol.slice(0, 5) + "..."
                  : details.symbol}
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

export function ManualHoldingsList({
  tokens,
  tokensMap,
}: ManualHoldingsListProps) {
  if (!tokens || tokens.length === 0) return null;

  return (
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
          <TokenTable tokens={tokens} tokensMap={tokensMap} />
        </CardContent>
      </Card>
    </div>
  );
}

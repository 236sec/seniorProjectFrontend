import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/constants/types/api/getWalletTypes";
import { Utils } from "alchemy-sdk";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatQuantity = (quantity: string) => {
    try {
      if (quantity.startsWith("0x")) {
        return Utils.formatUnits(quantity, 18);
      }
      return quantity;
    } catch (e) {
      void e;
      return quantity;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price (USD)</TableHead>
              <TableHead>Total (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
                <TableRow key={tx._id}>
                  <TableCell>
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={tx.tokenId.image.small}
                          alt={tx.tokenId.name}
                        />
                        <AvatarFallback>
                          {tx.tokenId.symbol.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{tx.tokenId.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {tx.tokenId.symbol.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.event_type}</TableCell>
                  <TableCell>{formatQuantity(tx.quantity)}</TableCell>
                  <TableCell>${tx.price_usd.toFixed(2)}</TableCell>
                  <TableCell>${tx.cashflow_usd.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

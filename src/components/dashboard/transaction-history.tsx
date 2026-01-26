import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetWalletTransactionsResponse } from "@/constants/types/api/getWalletTransactionsTypes";
import { Utils } from "alchemy-sdk";

interface TransactionHistoryProps {
  transactionsData: GetWalletTransactionsResponse | null;
  loading?: boolean;
  onPageChange: (limit: number, offset: number) => void;
}

export function TransactionHistory({
  transactionsData,
  loading = false,
  onPageChange,
}: TransactionHistoryProps) {
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

  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;

  const handlePrevPage = () => {
    if (pagination && pagination.hasPrevPage) {
      const newOffset = Math.max(0, pagination.offset - pagination.limit);
      onPageChange(pagination.limit, newOffset);
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.hasNextPage) {
      const newOffset = pagination.offset + pagination.limit;
      onPageChange(pagination.limit, newOffset);
    }
  };

  return (
    <Card className="min-w-25 w-full">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Quantity</TableHead>
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
                        {tx.tokenId ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={tx.tokenId.image?.small}
                                alt={tx.tokenId.name}
                              />
                              <AvatarFallback>
                                {tx.tokenId.symbol.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {tx.tokenId.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {tx.tokenId.symbol.length > 5
                                  ? tx.tokenId.symbol
                                      .slice(0, 5)
                                      .toUpperCase() + "..."
                                  : tx.tokenId.symbol.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{tx.type}</TableCell>
                      <TableCell>{tx.event_type}</TableCell>
                      <TableCell className="font-mono">
                        {formatQuantity(tx.quantity)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} (
                  {pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={handlePrevPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={handleNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

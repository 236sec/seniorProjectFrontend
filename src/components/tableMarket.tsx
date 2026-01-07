"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetMarketData } from "@/constants/types/api/gecko/getMarketTypes";
import { formatMarketCap, formatPrice } from "@/lib/formatters";
import { getMarket } from "@/services/gecko/getMarket";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SkeletonTable } from "./skeleton-table";

const TABLE_COLUMNS = [
  "#",
  "Coin",
  "Price",
  "24h %",
  "Market Cap",
  "Volume (24h)",
];

const ITEMS_PER_PAGE = 10;
const TOTAL_PAGES = 25;

function PercentageBadge({ value }: { value: number | null }) {
  if (value === null) return <span>N/A</span>;
  const isPositive = value >= 0;
  return (
    <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
      {isPositive ? "+" : ""}
      {value.toFixed(2)}%
    </Badge>
  );
}

export default function TableMarket() {
  const [marketData, setMarketData] = useState<GetMarketData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getMarket(
          {
            page,
            per_page: ITEMS_PER_PAGE,
            vs_currency: "usd",
          },
          60 // Cache TTL
        );
        setMarketData(data || []);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setMarketData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [page]);

  if (isLoading) {
    return <SkeletonTable columns={TABLE_COLUMNS} />;
  }

  if (!marketData || marketData.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-muted/20 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
        <p className="text-muted-foreground">No market data available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold tracked-tight">Market Overview</h2>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_COLUMNS.map((column) => (
                <TableHead
                  key={column}
                  className={
                    column === "#"
                      ? "w-12 text-center"
                      : column === "Coin"
                      ? ""
                      : "text-right"
                  }
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketData.map((coin) => (
              <TableRow
                key={coin.id}
                className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => router.push(`/coins/${coin.id}`)}
              >
                <TableCell className="font-medium text-center">
                  {coin.market_cap_rank}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={coin.image} alt={coin.name} />
                      <AvatarFallback>
                        {coin.symbol.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold leading-none text-sm">
                        {coin.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {coin.symbol.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatPrice(coin.current_price)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <PercentageBadge value={coin.price_change_percentage_24h} />
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {formatMarketCap(coin.market_cap)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {formatMarketCap(coin.total_volume)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="text-sm font-medium w-24 text-center">
          Page {page} of {TOTAL_PAGES}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
          disabled={page === TOTAL_PAGES || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

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
import { getBaseUrl } from "@/env";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SkeletonTable } from "./skeleton-table";

async function getMarket(page: number, per_page: number) {
  const response = await fetch(
    `${getBaseUrl()}/api/coingecko/market?page=${page}&per_page=${per_page}`
  );
  if (!response.ok) {
    throw new Error(
      "Failed to fetch wallet data with url: " +
        `${getBaseUrl()}/api/coingecko/market`
    );
  }
  return response.json() as Promise<GetMarketData[]>;
}

const tableColumns = [
  "#",
  "Coin",
  "Price",
  "24h %",
  "Market Cap",
  "Volume (24h)",
];

export default function TableMarket() {
  const [marketData, setMarketData] = useState<GetMarketData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = 25;
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    getMarket(page, 10)
      .then((data) => {
        setMarketData(data);
      })
      .catch((error) => {
        console.error("Error fetching market data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page]);

  const formatPrice = (price: number | null) => {
    if (price === null) {
      return "N/A";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number | null) => {
    if (marketCap === null) {
      return "N/A";
    }
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  const formatPercentage = (percentage: number | null) => {
    if (percentage === null) {
      return "N/A";
    }
    const isPositive = percentage >= 0;
    return (
      <Badge
        variant={isPositive ? "default" : "destructive"}
        className="text-xs"
      >
        {isPositive ? "+" : ""}
        {percentage.toFixed(2)}%
      </Badge>
    );
  };
  if (isLoading) {
    return <SkeletonTable columns={tableColumns} />;
  }

  if (!marketData || marketData.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
        <p className="text-gray-500">No market data available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map((column) => (
                <TableHead
                  key={column}
                  className={column === "#" ? "w-12.5" : "text-right"}
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
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => router.push(`/coins/${coin.id}`)}
              >
                <TableCell className="font-medium">
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
                    <div>
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {coin.symbol.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(coin.current_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage(coin.price_change_percentage_24h)}
                </TableCell>
                <TableCell className="text-right">
                  {formatMarketCap(coin.market_cap)}
                </TableCell>
                <TableCell className="text-right">
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
        <div className="text-sm font-medium">
          Page {page} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

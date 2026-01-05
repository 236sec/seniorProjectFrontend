"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetTrendingData } from "@/constants/types/api/gecko/getTrendingTypes";
import { getBaseUrl } from "@/env";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SkeletonTable } from "./skeleton-table";

async function getTrending() {
  const response = await fetch(`${getBaseUrl()}/api/coingecko/trending`);
  if (!response.ok) {
    throw new Error(
      "Failed to fetch trending data with url: " +
        `${getBaseUrl()}/api/coingecko/trending`
    );
  }
  return response.json() as Promise<GetTrendingData["coins"]>;
}

const tableColumns = ["Coin", "Price", "24h %"];

export default function TableTrending() {
  const [trendingData, setTrendingData] = useState<
    GetTrendingData["coins"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    getTrending()
      .then((data) => {
        setTrendingData(data.slice(0, 5));
      })
      .catch((error) => {
        console.error("Error fetching trending data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const formatPrice = (price: number | string) => {
    // The API might return string or number for price in 'data'
    // Based on types it is number, but let's be safe if it comes as string from some endpoints
    const numPrice = typeof price === "string" ? parseFloat(price) : price;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(numPrice);
  };

  const formatPercentage = (percentage: number) => {
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

  if (!trendingData || trendingData.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Trending Coins</h2>
        <p className="text-gray-500">No trending data available</p>
      </div>
    );
  }

  return (
    <div className="w-fit space-y-4">
      <h2 className="text-xl font-bold mb-4">Trending Coins</h2>
      <div className="rounded-md border">
        <Table className="w-[20%]">
          <TableHeader>
            <TableRow>
              {tableColumns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trendingData.map((coin) => (
              <TableRow
                key={coin.item.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => router.push(`/coins/${coin.item.id}`)}
              >
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={coin.item.small} alt={coin.item.name} />
                      <AvatarFallback>
                        {coin.item.symbol.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{coin.item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {coin.item.symbol.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatPrice(coin.item.data.price)}</TableCell>
                <TableCell>
                  {formatPercentage(
                    coin.item.data.price_change_percentage_24h?.usd || 0
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

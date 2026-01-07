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
import { formatPrice } from "@/lib/formatters";
import { getTrending } from "@/services/gecko/getTrending";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SkeletonTable } from "./skeleton-table";

const TABLE_COLUMNS = ["Coin", "Price", "24h %"];

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

export default function TableTrending() {
  const [trendingData, setTrendingData] = useState<
    GetTrendingData["coins"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getTrending();
        setTrendingData(data.coins.slice(0, 5));
      } catch (error) {
        console.error("Error fetching trending data:", error);
        setTrendingData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const safeFormatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return formatPrice(numPrice);
  };

  if (isLoading) {
    return <SkeletonTable columns={TABLE_COLUMNS} rows={5} />;
  }

  if (!trendingData || trendingData.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-muted/20 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Trending Coins</h2>
        <p className="text-muted-foreground">No trending data available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold tracked-tight">Trending Coins</h2>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_COLUMNS.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trendingData.map((coin) => (
              <TableRow
                key={coin.item.id}
                className="hover:bg-muted/50 cursor-pointer transition-colors"
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
                    <div className="flex flex-col">
                      <span className="font-semibold leading-none text-sm">
                        {coin.item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {coin.item.symbol.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">
                  {safeFormatPrice(coin.item.data.price)}
                </TableCell>
                <TableCell className="tabular-nums">
                  <PercentageBadge
                    value={coin.item.data.price_change_percentage_24h?.usd || 0}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

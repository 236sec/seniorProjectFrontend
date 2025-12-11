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
import { GetMarketData } from "@/constants/types/api/gecko/getMarketTypes";
import { getBaseUrl } from "@/env";

async function getMarket() {
  const response = await fetch(`${getBaseUrl()}/api/coingecko/market`);
  if (!response.ok) {
    throw new Error(
      "Failed to fetch wallet data with url: " +
        `${getBaseUrl()}/api/coingecko/market`
    );
  }
  return response.json() as Promise<GetMarketData[]>;
}

export default async function TableMarket() {
  const marketData = await getMarket();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
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
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Coin</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              {/* <TableHead className="text-right">7d %</TableHead> */}
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume (24h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketData.map((coin) => (
              <TableRow key={coin.id} className="hover:bg-muted/50">
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
                {/* <TableCell className="text-right">
                  {formatPercentage(
                    coin.price_change_percentage_7d_in_currency
                  )}
                </TableCell> */}
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
    </div>
  );
}

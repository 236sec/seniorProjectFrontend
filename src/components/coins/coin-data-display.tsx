"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetCoinData } from "@/constants/types/api/gecko/getCoinTypes";
import { GetSimplePriceData } from "@/constants/types/api/gecko/getSimplePriceTypes";
import { cn } from "@/lib/utils";
import { use, useEffect, useState } from "react";

interface CoinDataDisplayProps {
  coinDataPromise: Promise<
    | {
        coinData: GetCoinData | undefined;
        simplePriceData: GetSimplePriceData | undefined;
      }
    | undefined
  >;
}

export function CoinDataDisplay({ coinDataPromise }: CoinDataDisplayProps) {
  const data = use(coinDataPromise);

  if (!data || !data.coinData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No coin data available</p>
        </CardContent>
      </Card>
    );
  }

  const { coinData, simplePriceData } = data;
  const priceData = simplePriceData?.[coinData.id];

  return (
    <Card>
      <CoinHeader coinData={coinData} priceData={priceData} />
      <CardContent className="grid gap-6">
        {priceData && <MarketStats priceData={priceData} />}

        <div className="grid gap-4">
          <CoinMeta coinData={coinData} />
          <CoinCategories coinData={coinData} />
          <CoinSentiment coinData={coinData} />
          <CoinBlockchainInfo coinData={coinData} />
        </div>

        <CoinDescription coinData={coinData} />
        <CoinFooter coinData={coinData} />
      </CardContent>
    </Card>
  );
}

// Sub-components

function CoinHeader({
  coinData,
  priceData,
}: {
  coinData: GetCoinData;
  priceData: GetSimplePriceData[string] | undefined;
}) {
  return (
    <CardHeader>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 bg-muted">
          <AvatarImage src={coinData.image.large} alt={coinData.name} />
          <AvatarFallback>{coinData.symbol.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-2xl">{coinData.name}</CardTitle>
          <p className="text-muted-foreground font-medium">
            {coinData.symbol.toUpperCase()}
          </p>
        </div>
        {priceData && (
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${priceData.usd.toLocaleString()}
            </div>
            {priceData.usd_24h_change !== undefined && (
              <div
                className={cn(
                  "text-sm font-medium",
                  priceData.usd_24h_change >= 0
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                {priceData.usd_24h_change >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(priceData.usd_24h_change).toFixed(2)}%
              </div>
            )}
          </div>
        )}
      </div>
    </CardHeader>
  );
}

function MarketStats({
  priceData,
}: {
  priceData: NonNullable<GetSimplePriceData[string]>;
}) {
  return (
    <div className="grid gap-2 rounded-lg border bg-muted/20 p-4">
      <h3 className="text-sm font-semibold mb-2">Market Data</h3>
      <div className="grid gap-2 text-sm">
        {priceData.usd_market_cap !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Market Cap</span>
            <span className="font-medium">
              ${priceData.usd_market_cap.toLocaleString()}
            </span>
          </div>
        )}
        {priceData.usd_24h_vol !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">24h Volume</span>
            <span className="font-medium">
              ${priceData.usd_24h_vol.toLocaleString()}
            </span>
          </div>
        )}
        {priceData.last_updated_at && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Last Updated</span>
            <FormattedDate
              date={priceData.last_updated_at * 1000}
              className="font-medium"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CoinMeta({ coinData }: { coinData: GetCoinData }) {
  if (!coinData.market_cap_rank) return null;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">Market Cap Rank</span>
      <Badge variant="secondary">#{coinData.market_cap_rank}</Badge>
    </div>
  );
}

function CoinCategories({ coinData }: { coinData: GetCoinData }) {
  if (!coinData.categories || coinData.categories.length === 0) return null;

  return (
    <div>
      <span className="text-sm font-medium block mb-2">Categories</span>
      <div className="flex flex-wrap gap-2">
        {coinData.categories.map((category, index) => (
          <Badge key={index} variant="outline" className="font-normal">
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function CoinSentiment({ coinData }: { coinData: GetCoinData }) {
  if (
    !coinData.sentiment_votes_up_percentage &&
    !coinData.sentiment_votes_down_percentage
  )
    return null;

  return (
    <div>
      <span className="text-sm font-medium block mb-2">Sentiment</span>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-medium">
            ↑ {coinData.sentiment_votes_up_percentage?.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-600 font-medium">
            ↓ {coinData.sentiment_votes_down_percentage?.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function CoinBlockchainInfo({ coinData }: { coinData: GetCoinData }) {
  const hasInfo =
    coinData.hashing_algorithm ||
    coinData.block_time_in_minutes ||
    coinData.genesis_date;

  if (!hasInfo) return null;

  return (
    <div className="grid gap-2 text-sm pt-2">
      {coinData.hashing_algorithm && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hashing Algorithm</span>
          <span className="font-medium">{coinData.hashing_algorithm}</span>
        </div>
      )}
      {coinData.block_time_in_minutes && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Block Time</span>
          <span className="font-medium">
            {coinData.block_time_in_minutes} min
          </span>
        </div>
      )}
      {coinData.genesis_date && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Genesis Date</span>
          <span className="font-medium">{coinData.genesis_date}</span>
        </div>
      )}
    </div>
  );
}

function CoinDescription({ coinData }: { coinData: GetCoinData }) {
  if (!coinData.description?.en) return null;

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Description</span>
      <div
        className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: coinData.description.en }}
      />
    </div>
  );
}

function CoinFooter({ coinData }: { coinData: GetCoinData }) {
  if (!coinData.last_updated) return null;
  return (
    <div className="border-t pt-4 text-xs text-muted-foreground">
      <span>Last updated: </span>
      <FormattedDate date={coinData.last_updated} />
    </div>
  );
}

// Utility Component for Client-side Date Rendering
function FormattedDate({
  date,
  className,
}: {
  date: string | number | Date;
  className?: string;
}) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    setFormatted(new Date(date).toLocaleString());
  }, [date]);

  if (!formatted) return <span className={className}>...</span>;

  return <span className={className}>{formatted}</span>;
}

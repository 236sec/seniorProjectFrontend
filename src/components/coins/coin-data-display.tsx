"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetCoinData } from "@/constants/types/api/gecko/getCoinTypes";
import { GetSimplePriceData } from "@/constants/types/api/gecko/getSimplePriceTypes";
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
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [formattedDateCoinData, setFormattedDateCoinData] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (priceData && priceData.last_updated_at) {
      const date = new Date(priceData.last_updated_at * 1000);
      setFormattedDate(date.toLocaleString());
    }
  }, [priceData]);

  useEffect(() => {
    if (coinData.last_updated) {
      const date = new Date(coinData.last_updated);
      setFormattedDateCoinData(date.toLocaleString());
    }
  }, [coinData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={coinData.image.large} alt={coinData.name} />
            <AvatarFallback>{coinData.symbol.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{coinData.name}</CardTitle>
            <p className="text-muted-foreground">
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
                  className={`text-sm ${
                    priceData.usd_24h_change >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {priceData.usd_24h_change >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(priceData.usd_24h_change).toFixed(2)}%
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Price Data */}
          {priceData && (
            <div className="grid gap-2 rounded-lg border p-4">
              <h3 className="text-sm font-semibold">Market Data</h3>
              <div className="grid gap-2 text-sm">
                {priceData.usd_market_cap !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Cap</span>
                    <span className="font-medium">
                      ${priceData.usd_market_cap.toLocaleString()}
                    </span>
                  </div>
                )}
                {priceData.usd_24h_vol !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="font-medium">
                      ${priceData.usd_24h_vol.toLocaleString()}
                    </span>
                  </div>
                )}
                {priceData.last_updated_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Market Cap Rank */}
          {coinData.market_cap_rank && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Market Cap Rank</span>
              <Badge variant="secondary">#{coinData.market_cap_rank}</Badge>
            </div>
          )}

          {/* Categories */}
          {coinData.categories && coinData.categories.length > 0 && (
            <div>
              <span className="text-sm font-medium">Categories</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {coinData.categories.map((category, index) => (
                  <Badge key={index} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment */}
          {(coinData.sentiment_votes_up_percentage ||
            coinData.sentiment_votes_down_percentage) && (
            <div>
              <span className="text-sm font-medium">Sentiment</span>
              <div className="mt-2 flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">
                    ↑ {coinData.sentiment_votes_up_percentage?.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">
                    ↓ {coinData.sentiment_votes_down_percentage?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Blockchain Info */}
          <div className="grid gap-2 text-sm">
            {coinData.hashing_algorithm && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hashing Algorithm</span>
                <span className="font-medium">
                  {coinData.hashing_algorithm}
                </span>
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

          {/* Description */}
          {coinData.description?.en && (
            <div>
              <span className="text-sm font-medium">Description</span>
              <div
                className="mt-2 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: coinData.description.en }}
              />
            </div>
          )}

          {/* Last Updated */}
          {coinData.last_updated && (
            <div className="border-t pt-4 text-xs text-muted-foreground">
              Last updated: {formattedDateCoinData}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

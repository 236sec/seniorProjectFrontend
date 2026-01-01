"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetCoinData } from "@/constants/types/api/gecko/getCoinTypes";
import { use } from "react";

interface CoinDataDisplayProps {
  coinDataPromise: Promise<GetCoinData | undefined>;
}

export function CoinDataDisplay({ coinDataPromise }: CoinDataDisplayProps) {
  const coinData = use(coinDataPromise);

  if (!coinData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No coin data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={coinData.image.large} alt={coinData.name} />
            <AvatarFallback>{coinData.symbol.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{coinData.name}</CardTitle>
            <p className="text-muted-foreground">
              {coinData.symbol.toUpperCase()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
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
              Last updated: {new Date(coinData.last_updated).toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

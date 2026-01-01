"use client";

import { PriceChartDisplay } from "@/components/coins/price-chart-display";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHistoricalPrices } from "@/services/getHistoricalPrices";
import { useEffect, useState } from "react";

export const description = "An interactive area chart";

interface ChartData {
  date: number;
  price: number;
  market_cap: number;
  volume: number;
}

enum TimeRange {
  SEVEN_DAYS = "7d",
  THIRTY_DAYS = "30d",
  NINETY_DAYS = "90d",
  ONE_YEAR = "1y",
}

export function ChartAreaInteractive({
  coinId = "bitcoin",
}: {
  coinId?: string;
}) {
  const [timeRange, setTimeRange] = useState(TimeRange.SEVEN_DAYS as string);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const timeRangeOptions = [
    { label: "Last 7 days", value: TimeRange.SEVEN_DAYS },
    { label: "Last 30 days", value: TimeRange.THIRTY_DAYS },
    {
      label: "Last 3 months",
      value: TimeRange.NINETY_DAYS,
    },
    { label: "Last 1 year", value: TimeRange.ONE_YEAR },
  ];
  const getDaysForTimeRange = (range: TimeRange) => {
    switch (range) {
      case TimeRange.SEVEN_DAYS:
        return 7;
      case TimeRange.THIRTY_DAYS:
        return 30;
      case TimeRange.NINETY_DAYS:
        return 90;
      case TimeRange.ONE_YEAR:
        return 365;
      default:
        return 30;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const days = getDaysForTimeRange(timeRange as TimeRange);
      try {
        const data = await getHistoricalPrices({ id: coinId, days });

        if (data && data.prices) {
          const formattedData = data.prices.map((item) => ({
            date: new Date(item.date).getTime(),
            price: item.price,
            market_cap: item.market_cap,
            volume: item.volume_24h,
          }));
          setChartData(formattedData);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Failed to fetch chart data", error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, coinId]);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="capitalize">{coinId} Price Chart</CardTitle>
          <CardDescription>
            Showing price history for the last{" "}
            {timeRangeOptions.find((opt) => opt.value === timeRange)?.label ||
              "selected range"}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-40 rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-62.5 w-full items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : (
          <PriceChartDisplay chartData={chartData} />
        )}
      </CardContent>
    </Card>
  );
}

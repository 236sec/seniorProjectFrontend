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
import { AvailableRanges } from "@/constants/types/api/tokens/getHistoricalPricesTypes";
import { getHistoricalPrices } from "@/services/getHistoricalPrices";
import { useEffect, useState } from "react";

export const description = "An interactive area chart";

export interface ChartData {
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

const TIME_RANGE_OPTIONS = [
  {
    label: "Last 7 days",
    value: TimeRange.SEVEN_DAYS,
    days: 7,
    rangeKey: "7d" as keyof AvailableRanges,
  },
  {
    label: "Last 30 days",
    value: TimeRange.THIRTY_DAYS,
    days: 30,
    rangeKey: "1m" as keyof AvailableRanges,
  },
  {
    label: "Last 3 months",
    value: TimeRange.NINETY_DAYS,
    days: 90,
    rangeKey: "3m" as keyof AvailableRanges,
  },
  {
    label: "Last 1 year",
    value: TimeRange.ONE_YEAR,
    days: 365,
    rangeKey: "1y" as keyof AvailableRanges,
  },
] as const;

export function ChartAreaInteractive({
  coinId = "bitcoin",
}: {
  coinId?: string;
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.SEVEN_DAYS);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableRanges, setAvailableRanges] =
    useState<AvailableRanges | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      const selectedOption = TIME_RANGE_OPTIONS.find(
        (opt) => opt.value === timeRange,
      );
      const days = selectedOption?.days || 30;

      try {
        const data = await getHistoricalPrices({ id: coinId, days });

        if (mounted && data?.prices) {
          const formattedData = data.prices.map((item) => ({
            date: new Date(item.date).getTime(),
            price: item.price,
            market_cap: item.market_cap,
            volume: item.volume_24h,
          }));
          setChartData(formattedData);
          setAvailableRanges(data.availableRanges);
        } else if (mounted) {
          setChartData([]);
        }
      } catch (error) {
        console.error("Failed to fetch chart data", error);
        if (mounted) setChartData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [timeRange, coinId]);

  return (
    <Card>
      <ChartHeader
        coinId={coinId}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        availableRanges={availableRanges}
      />
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex aspect-auto h-62.5 w-full items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : (
          <PriceChartDisplay chartData={chartData} />
        )}
      </CardContent>
    </Card>
  );
}

function ChartHeader({
  coinId,
  timeRange,
  onTimeRangeChange,
  availableRanges,
}: {
  coinId: string;
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
  availableRanges: AvailableRanges | null;
}) {
  const selectedLabel =
    TIME_RANGE_OPTIONS.find((opt) => opt.value === timeRange)?.label ||
    "selected range";

  return (
    <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
      <div className="grid flex-1 gap-1">
        <CardTitle className="capitalize">{coinId} Price Chart</CardTitle>
        <CardDescription>
          Showing price history for the last {selectedLabel}
        </CardDescription>
      </div>
      <Select
        value={timeRange}
        onValueChange={(value) => onTimeRangeChange(value as TimeRange)}
      >
        <SelectTrigger
          className="w-40 rounded-lg sm:ml-auto"
          aria-label="Select a value"
        >
          <SelectValue placeholder="Last 3 months" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {TIME_RANGE_OPTIONS.filter((option) =>
            availableRanges ? availableRanges[option.rangeKey] : true,
          ).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardHeader>
  );
}

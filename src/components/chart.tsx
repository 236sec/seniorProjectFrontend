"use client";

import { getHistoricalPrices } from "@/services/getHistoricalPrices";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "An interactive area chart";

interface ChartData {
  date: number;
  price: number;
  market_cap: number;
  volume: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartData;
  }>;
  label?: number;
}

const chartConfig = {
  price: {
    label: "Price",
    theme: {
      light: "hsl(270, 70%, 55%)",
      dark: "hsl(160, 100%, 50%)",
    },
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  coinId = "bitcoin",
}: {
  coinId?: string;
}) {
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const days = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90;
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

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const compactFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  });

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length && label) {
      const data = payload[0].payload;
      return (
        <div className="border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
          <div className="font-medium">
            {new Date(label).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
          <div className="grid gap-1.5">
            <div className="flex w-full flex-wrap items-stretch gap-2">
              <div className="flex flex-1 justify-between leading-none items-center">
                <span className="text-muted-foreground">Price</span>
                <span className="text-foreground font-mono font-medium tabular-nums">
                  {currencyFormatter.format(data.price)}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-stretch gap-2">
              <div className="flex flex-1 justify-between leading-none items-center">
                <span className="text-muted-foreground">Market Cap</span>
                <span className="text-foreground font-mono font-medium tabular-nums">
                  {compactFormatter.format(data.market_cap)}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-stretch gap-2">
              <div className="flex flex-1 justify-between leading-none items-center">
                <span className="text-muted-foreground">Volume</span>
                <span className="text-foreground font-mono font-medium tabular-nums">
                  {compactFormatter.format(data.volume)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="capitalize">{coinId} Price Chart</CardTitle>
          <CardDescription>
            Showing price history for the last{" "}
            {timeRange === "90d"
              ? "3 months"
              : timeRange === "30d"
              ? "30 days"
              : "7 days"}
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
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-62.5 w-full items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-62.5 w-full"
            style={{ height: "500px" }}
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-price)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-price)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Area
                dataKey="price"
                type="natural"
                fill="url(#fillPrice)"
                stroke="var(--color-price)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-62.5 w-full items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

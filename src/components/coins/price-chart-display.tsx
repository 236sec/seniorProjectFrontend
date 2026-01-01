"use client";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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

interface PriceChartDisplayProps {
  chartData: ChartData[];
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

export function PriceChartDisplay({ chartData }: PriceChartDisplayProps) {
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

  if (chartData.length === 0) {
    return (
      <div className="flex h-62.5 w-full items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
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
  );
}

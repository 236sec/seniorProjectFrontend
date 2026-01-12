"use client";

import { ChartData } from "@/components/coins/chart";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { memo, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    []
  );

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
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`;
            }
            if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toFixed(2);
          }}
        />
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
        <ChartTooltip
          cursor={false}
          content={
            <CustomTooltip
              currencyFormatter={currencyFormatter}
              compactFormatter={compactFormatter}
            />
          }
        />
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

const CustomTooltip = memo(
  ({
    active,
    payload,
    label,
    currencyFormatter,
    compactFormatter,
  }: TooltipProps & {
    currencyFormatter: Intl.NumberFormat;
    compactFormatter: Intl.NumberFormat;
  }) => {
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
  }
);
CustomTooltip.displayName = "CustomTooltip";

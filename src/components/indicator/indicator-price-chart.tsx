"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

export interface DataPoint {
  date: string;
  value: number;
}

interface IndicatorPriceChartProps {
  data1: DataPoint[];
  data2?: DataPoint[];
  data3?: DataPoint[];
  title?: string;
  description?: string;
  line1Label?: string;
  line2Label?: string;
  line3Label?: string;
  line1Color?: string;
  line2Color?: string;
  line3Color?: string;
}

export function IndicatorPriceChart({
  data1,
  data2,
  data3,
  title = "Comparative Chart",
  description = "Two-line comparison",
  line1Label = "Line 1",
  line2Label = "Line 2",
  line3Label = "Line 3",
  line1Color = "hsl(217 91% 60%)",
  line2Color = "hsl(25 95% 53%)",
  line3Color = "hsl(120 80% 50%)",
}: IndicatorPriceChartProps) {
  // Dynamic chart config based on provided data
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      line1: {
        label: line1Label,
        color: line1Color,
      },
    };

    if (data2 && data2.length > 0) {
      config.line2 = {
        label: line2Label,
        color: line2Color,
      };
    }

    if (data3 && data3.length > 0) {
      config.line3 = {
        label: line3Label,
        color: line3Color,
      };
    }

    return config;
  }, [
    line1Label,
    line2Label,
    line3Label,
    line1Color,
    line2Color,
    line3Color,
    data2,
    data3,
  ]);

  // Merge data based on date
  const chartData = useMemo(() => {
    const dataMap = new Map<
      string,
      { date: string; line1?: number; line2?: number; line3?: number }
    >();

    if (Array.isArray(data1)) {
      data1.forEach((item) => {
        const dateObj = new Date(item.date);
        if (isNaN(dateObj.getTime())) return;
        const dateKey = dateObj.toISOString().split("T")[0];

        const existing = dataMap.get(dateKey) || { date: dateKey };
        dataMap.set(dateKey, { ...existing, line1: item.value });
      });
    }

    if (Array.isArray(data2) && data2.length > 0) {
      data2.forEach((item) => {
        const dateObj = new Date(item.date);
        if (isNaN(dateObj.getTime())) return;
        const dateKey = dateObj.toISOString().split("T")[0];

        const existing = dataMap.get(dateKey) || { date: dateKey };
        dataMap.set(dateKey, { ...existing, line2: item.value });
      });
    }

    if (Array.isArray(data3) && data3.length > 0) {
      data3.forEach((item) => {
        const dateObj = new Date(item.date);
        if (isNaN(dateObj.getTime())) return;
        const dateKey = dateObj.toISOString().split("T")[0];

        const existing = dataMap.get(dateKey) || { date: dateKey };
        dataMap.set(dateKey, { ...existing, line3: item.value });
      });
    }

    // Convert map to array, ensure all keys exist (default to 0), and sort by date
    return Array.from(dataMap.values())
      .map((item) => ({
        date: item.date,
        line1: item.line1 ?? 0,
        line2: item.line2 ?? 0,
        line3: item.line3 ?? 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data1, data2, data3]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
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
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Line
                  dataKey="line1"
                  type="monotone"
                  stroke="var(--color-line1)"
                  strokeWidth={2}
                  dot={false}
                />
                {data2 && data2.length > 0 && (
                  <Line
                    dataKey="line2"
                    type="monotone"
                    stroke="var(--color-line2)"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {data3 && data3.length > 0 && (
                  <Line
                    dataKey="line3"
                    type="monotone"
                    stroke="var(--color-line3)"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

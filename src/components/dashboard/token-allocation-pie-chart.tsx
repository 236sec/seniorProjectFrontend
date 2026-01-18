"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AggregatedToken } from "@/lib/portfolio-utils";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";

interface TokenAllocationPieChartProps {
  tokens: AggregatedToken[];
  className?: string;
}

export function TokenAllocationPieChart({
  tokens,
  className,
}: TokenAllocationPieChartProps) {
  const chartData = useMemo(() => {
    // Filter out tokens with 0 value and sort by value descending
    const activeTokens = tokens
      .filter((t) => t.currentValue > 0)
      .sort((a, b) => b.currentValue - a.currentValue);

    // Limit to top 5 and group rest as "Other" if there are many
    if (activeTokens.length <= 5) {
      return activeTokens.map((token, index) => ({
        name: token.symbol,
        value: token.currentValue,
        fill: `var(--chart-${(index % 5) + 1})`,
        fullName: token.name,
      }));
    }

    const top5 = activeTokens.slice(0, 5);
    const others = activeTokens.slice(5);
    const otherValue = others.reduce((sum, t) => sum + t.currentValue, 0);

    const data = top5.map((token, index) => ({
      name: token.symbol,
      value: token.currentValue,
      fill: `var(--chart-${(index % 5) + 1})`,
      fullName: token.name,
    }));

    if (otherValue > 0) {
      data.push({
        name: "Others",
        value: otherValue,
        fill: "var(--muted-foreground)",
        fullName: "Other Tokens",
      });
    }

    return data;
  }, [tokens]);

  const totalValue = useMemo(() => {
    return tokens.reduce((sum, t) => sum + t.currentValue, 0);
  }, [tokens]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      value: {
        label: "Value",
      },
    };

    chartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });

    return config;
  }, [chartData]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalValue.toLocaleString(undefined, {
                            style: "currency",
                            currency: "USD",
                            notation: "compact",
                            maximumFractionDigits: 1,
                          })}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Value
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

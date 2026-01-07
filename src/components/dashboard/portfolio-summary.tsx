import { formatPercentage, PortfolioSummary } from "@/lib/portfolio-utils";

interface PortfolioStatsProps {
  summary: PortfolioSummary;
}

export function PortfolioStats({ summary }: PortfolioStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col space-y-1">
        <span className="text-sm text-muted-foreground">Total Value</span>
        <span className="text-2xl font-bold">
          $
          {summary.totalCurrentValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      <div className="flex flex-col space-y-1">
        <span className="text-sm text-muted-foreground">Total PNL</span>
        <span
          className={`text-2xl font-bold ${
            summary.totalPnlPercentage >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatPercentage(summary.totalPnlPercentage)}
        </span>
        <span className="text-xs text-muted-foreground">
          {summary.totalPnlAmount >= 0 ? "+" : ""}$
          {summary.totalPnlAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      <div className="flex flex-col space-y-1">
        <span className="text-sm text-muted-foreground">24h Change</span>
        <span
          className={`text-2xl font-bold ${
            summary.weighted24hChange >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {summary.weighted24hChange >= 0 ? "+" : ""}
          {summary.weighted24hChange.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

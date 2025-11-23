export interface GetHistoricalChartParams {
  id: string;
  vs_currency?: string;
  days?: number;
  interval?: "daily";
  precision?: string;
}

export interface GetHistoricalChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

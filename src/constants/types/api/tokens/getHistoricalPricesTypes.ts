export interface HistoricalPriceDataPoint {
  date: string;
  price: number;
  volume_24h: number;
  market_cap: number;
}

export interface AvailableRanges {
  "1d": boolean;
  "7d": boolean;
  "1m": boolean;
  "3m": boolean;
  "1y": boolean;
}

export interface GetHistoricalPricesResponse {
  prices: HistoricalPriceDataPoint[];
  totalAvailableDays: number;
  availableRanges: AvailableRanges;
  oldestDataPoint: string;
  newestDataPoint: string;
}

export interface GetHistoricalPricesParams {
  id: string;
  days: number;
}

export interface GetHistoricalPricesError {
  statusCode: number;
  message: string | string[];
  error: string;
}

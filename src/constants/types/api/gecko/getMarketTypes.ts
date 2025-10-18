export interface GetMarketParams {
  per_page: number;
  page: number;
  vs_currency?: string;
  include_tokens?: string;
  precision?: number;
}

export interface GetMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h_in_currency: number;
}

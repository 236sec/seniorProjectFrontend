export interface GetMarketParams {
  per_page: number;
  page: number;
  vs_currency?: string;
  include_tokens?: string;
  precision?: string;
}

export interface GetMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  market_cap_rank: number | null;
  image: string;
  price_change_percentage_24h: number | null;
}

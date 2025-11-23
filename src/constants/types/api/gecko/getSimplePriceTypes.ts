export interface GetSimplePriceParams {
  ids: string[];
  vs_currencies: string[];
  names: string[];
  symbols: string[];
  include_tokens: "top" | "all";
  include_market_cap: boolean;
  include_24hr_vol: boolean;
  include_24hr_change: boolean;
  include_last_updated_at: boolean;
  precision: string;
}

export interface GetSimplePriceData {
  [id: string]: {
    usd: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number;
    last_updated_at?: number;
  };
}

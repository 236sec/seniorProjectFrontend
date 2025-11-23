export interface GetCoinParams {
  id: string;
  localization?: boolean;
  tickers?: boolean;
  market_data?: boolean;
  community_data?: boolean;
  developer_data?: boolean;
  sparkline?: boolean;
  dex_pair_format?: "contract_address" | "symbol";
}

export interface GetCoinData {
  id: string;
  symbol: string;
  name: string;
  web_slug: string;
  asset_platform_id: string;
  block_time_in_minutes: number;
  hashing_algorithm: string;
  categories: string[];
  preview_listing: boolean;
  public_notice: string;
  additional_notices: string[];
  description: Record<string, string>;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  country_origin: string;
  genesis_date: string;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  market_cap_rank: number;
  market_data: any;
  last_updated: string;
}

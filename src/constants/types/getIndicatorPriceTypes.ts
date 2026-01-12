export interface IndicatorPriceParams {
  coinId: string;
}

export interface GetIndicatorPriceRequest {
  params: IndicatorPriceParams;
}

export interface DataPoint {
  date: string;
  price: number;
}

export interface GetIndicatorPriceResponse {
  last_updated: string;
  data: DataPoint[];
}

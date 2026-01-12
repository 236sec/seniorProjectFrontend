export interface IndicatorParams {
  coinId: string;
}

export interface IndicatorQueryParams {
  indicatorType: IndicatorType;
}

export interface GetIndicatorRequest {
  params: IndicatorParams;
  query: IndicatorQueryParams;
}

export interface SimpleDataPoint {
  date: string;
  value: number;
}

export interface BollingerDataPoint {
  date: string;
  bb_upper: number;
  bb_middle: number;
  bb_lower: number;
}

interface IndicatorMap {
  rsi: SimpleDataPoint;
  coppock: SimpleDataPoint;
  ema20: SimpleDataPoint;
  hma: SimpleDataPoint;
  kalman: SimpleDataPoint;
  obv: SimpleDataPoint;
  sma20: SimpleDataPoint;
  volatility: SimpleDataPoint;
  zscore: SimpleDataPoint;
  bollinger: BollingerDataPoint;
}

export type IndicatorType = keyof IndicatorMap;

export type SimpleIndicatorType = {
  [K in keyof IndicatorMap]: IndicatorMap[K] extends SimpleDataPoint
    ? K
    : never;
}[keyof IndicatorMap];

export interface GetIndicatorResponse<T extends IndicatorType = IndicatorType> {
  last_updated: string;
  data: IndicatorMap[T][];
}

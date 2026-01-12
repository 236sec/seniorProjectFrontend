export enum IndicatorSameScaleEnum {
  EMA20 = "ema20",
  HMA = "hma",
  KALMAN = "kalman",
  SMA20 = "sma20",
  BOLLINGER = "bollinger",
}

export enum IndicatorDifferentScaleEnum {
  RSI = "rsi",
  COPPOCK = "coppock",
  OBV = "obv",
  ZSCORE = "zscore",
  VOLATILITY = "volatility",
}

export type IndicatorType =
  | IndicatorSameScaleEnum
  | IndicatorDifferentScaleEnum;

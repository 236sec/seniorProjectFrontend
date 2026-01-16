"use client";

import {
  IndicatorDifferentScaleEnum,
  IndicatorSameScaleEnum,
} from "@/constants/enum/IndicatorType";
import {
  IndicatorType,
  SimpleDataPoint,
  SimpleIndicatorType,
} from "@/constants/types/api/getIndicatorTypes";
import { getIndicator } from "@/services/getIndicator";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Spinner } from "../ui/spinner";
import { DataPoint, IndicatorPriceChart } from "./indicator-price-chart";

interface IndicatorMainDisplayProps {
  priceData: DataPoint[];
  coinId: string;
}

const SAME_SCALE_INDICATORS: IndicatorSameScaleEnum[] = [
  IndicatorSameScaleEnum.SMA20,
  IndicatorSameScaleEnum.HMA,
  IndicatorSameScaleEnum.KALMAN,
  IndicatorSameScaleEnum.EMA20,
  // IndicatorSameScaleEnum.BOLLINGER,
];

const DIFFERENT_SCALE_INDICATORS: IndicatorDifferentScaleEnum[] = [
  IndicatorDifferentScaleEnum.RSI,
  IndicatorDifferentScaleEnum.COPPOCK,
  IndicatorDifferentScaleEnum.OBV,
  IndicatorDifferentScaleEnum.ZSCORE,
  IndicatorDifferentScaleEnum.VOLATILITY,
];

export function IndicatorMainDisplay({
  priceData,
  coinId,
}: IndicatorMainDisplayProps) {
  const [selectedSameScaleIndicator, setSelectedSameScaleIndicator] =
    useState<IndicatorType>(IndicatorSameScaleEnum.SMA20);
  const [sameScaleIndicatorData, setSameScaleIndicatorData] = useState<
    SimpleDataPoint[]
  >([]);
  const [selectedDifferentScaleIndicator, setSelectedDifferentScaleIndicator] =
    useState<IndicatorType>(IndicatorDifferentScaleEnum.RSI);
  const [differentScaleIndicatorData, setDifferentScaleIndicatorData] =
    useState<SimpleDataPoint[]>([]);
  const [isSameScaleLoading, setIsSameScaleLoading] = useState(false);
  const [isDifferentScaleLoading, setIsDifferentScaleLoading] = useState(false);

  useEffect(() => {
    const fetchIndicatorData = async () => {
      setIsSameScaleLoading(true);
      try {
        const response = await getIndicator({
          params: { coinId },
          query: {
            indicatorType: selectedSameScaleIndicator as SimpleIndicatorType,
          },
        });

        if (response?.data) {
          setSameScaleIndicatorData(response.data as SimpleDataPoint[]);
        }
      } catch (error) {
        console.error("Error fetching indicator data:", error);
        setSameScaleIndicatorData([]);
      } finally {
        setIsSameScaleLoading(false);
      }
    };

    fetchIndicatorData();
  }, [selectedSameScaleIndicator, coinId]);

  useEffect(() => {
    const fetchIndicatorData = async () => {
      setIsDifferentScaleLoading(true);
      try {
        const response = await getIndicator({
          params: { coinId },
          query: {
            indicatorType:
              selectedDifferentScaleIndicator as SimpleIndicatorType,
          },
        });

        if (response?.data) {
          setDifferentScaleIndicatorData(response.data as SimpleDataPoint[]);
        }
      } catch (error) {
        console.error("Error fetching indicator data:", error);
        setDifferentScaleIndicatorData([]);
      } finally {
        setIsDifferentScaleLoading(false);
      }
    };

    fetchIndicatorData();
  }, [selectedDifferentScaleIndicator, coinId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select
          value={selectedSameScaleIndicator}
          onValueChange={(value) =>
            setSelectedSameScaleIndicator(value as SimpleIndicatorType)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Indicator" />
          </SelectTrigger>
          <SelectContent>
            {SAME_SCALE_INDICATORS.map((indicator) => (
              <SelectItem key={indicator} value={indicator}>
                {indicator.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isSameScaleLoading && <Spinner />}
      </div>

      <IndicatorPriceChart
        title={`Price vs ${selectedSameScaleIndicator.toUpperCase()}`}
        line1Label="Price "
        data1={priceData}
        data2={sameScaleIndicatorData}
        line2Label={selectedSameScaleIndicator.toUpperCase()}
      />

      <div className="flex items-center gap-2">
        <Select
          value={selectedDifferentScaleIndicator}
          onValueChange={(value) =>
            setSelectedDifferentScaleIndicator(value as SimpleIndicatorType)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Indicator" />
          </SelectTrigger>
          <SelectContent>
            {DIFFERENT_SCALE_INDICATORS.map((indicator) => (
              <SelectItem key={indicator} value={indicator}>
                {indicator.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isDifferentScaleLoading && <Spinner />}
      </div>

      <IndicatorPriceChart
        title={`${selectedDifferentScaleIndicator.toUpperCase()} Over Time`}
        line1Label={selectedDifferentScaleIndicator}
        data1={differentScaleIndicatorData}
      />
    </div>
  );
}

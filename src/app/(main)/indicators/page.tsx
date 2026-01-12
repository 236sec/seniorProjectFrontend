import { IndicatorMainDisplay } from "@/components/indicator/indicator-main-display";
import { capitalizeFirstLetter } from "@/lib/utils";
import { getIndicatorPrice } from "@/services/getIndicatorPrice";
import { Suspense } from "react";

export default async function IndicatorPage() {
  const coinId = "bitcoin";
  const indicatorPrices = await getIndicatorPrice({
    params: { coinId },
  });
  const data1 = indicatorPrices?.data ?? [];
  const formattedData = data1.map((point) => ({
    date: point.date,
    value: point.price,
  }));
  return (
    <div className="container mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">
        {capitalizeFirstLetter(coinId)} Indicator
      </h1>
      <Suspense fallback={<div>Loading indicator data...</div>}>
        <IndicatorMainDisplay priceData={formattedData} coinId={coinId} />
      </Suspense>
    </div>
  );
}

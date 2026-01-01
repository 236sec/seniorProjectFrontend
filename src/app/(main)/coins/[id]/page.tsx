import { ChartAreaInteractive } from "@/components/coins/chart";
import { CoinDataDisplay } from "@/components/coins/coin-data-display";
import { GetCoinData } from "@/constants/types/api/gecko/getCoinTypes";
import { GetSimplePriceData } from "@/constants/types/api/gecko/getSimplePriceTypes";
import { getBaseUrl } from "@/env";
import { Suspense } from "react";

export default async function CoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coinDataPromised = fetch(
    `${getBaseUrl()}/api/coingecko/coins/${id}`
  ).then((res) => res.json()) as Promise<
    | {
        coinData: GetCoinData | undefined;
        simplePriceData: GetSimplePriceData | undefined;
      }
    | undefined
  >;
  return (
    <div className="container mx-auto space-y-6 p-6">
      <ChartAreaInteractive coinId={id} />
      <Suspense fallback={<div>Loading coin data...</div>}>
        <CoinDataDisplay coinDataPromise={coinDataPromised} />
      </Suspense>
    </div>
  );
}

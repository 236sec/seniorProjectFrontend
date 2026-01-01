import { ChartAreaInteractive } from "@/components/coins/chart";
import { CoinDataDisplay } from "@/components/coins/coin-data-display";
import { getCoin } from "@/services/gecko/getCoin";
import { Suspense } from "react";

export default async function CoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coinDataPromised = getCoin({ id }, 300);
  return (
    <div className="container mx-auto space-y-6 p-6">
      <ChartAreaInteractive coinId={id} />
      <Suspense fallback={<div>Loading coin data...</div>}>
        <CoinDataDisplay coinDataPromise={coinDataPromised} />
      </Suspense>
    </div>
  );
}

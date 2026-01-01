import { ChartAreaInteractive } from "@/components/coins/chart";

export default async function CoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h1>Coin Page</h1>
      <ChartAreaInteractive coinId={id} />
    </div>
  );
}

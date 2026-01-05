import TableMarket from "@/components/tableMarket";
import TableTrending from "@/components/tableTrending";

export default function Home() {
  return (
    <div className="flex flex-col justify-items-center min-h-screen p-4 space-y-8">
      <TableMarket />
      <TableTrending />
    </div>
  );
}

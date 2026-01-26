import {
  NativeBalanceData,
  TokenBalanceData,
} from "@/constants/types/api/alchemy/getAddressBalancesTypes";

interface TokenRowProps {
  data: TokenBalanceData | NativeBalanceData;
}

export function TokenRow({ data }: TokenRowProps) {
  return (
    <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md border text-sm transition-colors">
      <div className="flex items-center gap-3">
        {data.token.image?.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.token.image.thumb}
            alt={data.token.symbol}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
            {data.token.symbol.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{data.token.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded">
              {data.network}
            </span>
          </div>
          <span className="text-xs text-muted-foreground uppercase">
            {data.token.symbol}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono font-medium">
          {parseFloat(data.balanceFormatted).toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })}
        </div>
      </div>
    </div>
  );
}

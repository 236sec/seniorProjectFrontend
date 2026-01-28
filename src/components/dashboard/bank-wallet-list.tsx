import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    BankWallet,
    TokensMap
} from "@/constants/types/api/getWalletTypes";
import { Utils } from "alchemy-sdk"; // Assuming we use same utils or basic parsing
import { AddBankWalletDialog } from "./add-bank-wallet-dialog";
import { SyncBankWalletDialog } from "./sync-bank-wallet-dialog";

interface BankWalletListProps {
  wallets: BankWallet[];
  walletId: string;
  tokensMap: TokensMap;
  refreshWalletData: () => void;
}

export function BankWalletList({
  wallets,
  walletId,
  tokensMap,
  refreshWalletData,
}: BankWalletListProps) {
  return (
    <div className="space-y-4 w-full overflow-hidden">
      <h3 className="text-lg font-semibold">Bank Wallets</h3>
      {wallets.map((bankWallet) => (
        <Card key={bankWallet._id}>
          <CardHeader className="pb-3">
            <div className="flex flex-row items-start justify-between w-full gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="font-mono text-base truncate">
                  Bank Wallet ({bankWallet._id.slice(-4)})
                </CardTitle>
                <CardDescription>
                  Added on{" "}
                  {new Date(bankWallet.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex-shrink-0">
                <SyncBankWalletDialog
                  bankWalletId={bankWallet._id}
                  walletId={walletId}
                  onChangeSubmitting={refreshWalletData}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bankWallet.tokens && bankWallet.tokens.length > 0 ? (
              <div className="space-y-2">
                 {bankWallet.tokens.map((token, index) => {
                     const tokenDetails = tokensMap[token.tokenId];
                     const symbol = tokenDetails?.symbol || token.tokenId;
                     const name = tokenDetails?.name || token.tokenId;
                     const image = tokenDetails?.image?.small || "";
                     const price = tokenDetails?.currentPrice || 0;
                     // Assuming balance is hex string similar to blockchain wallet, if not needs adjustment
                     // Based on sample: "balance": "0xce1c18"
                     const balance = parseFloat(Utils.formatUnits(token.balance, 18)); 
                     const value = balance * price;

                     return (
                         <div key={index} className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50">
                             <div className="flex items-center gap-3">
                                 <Avatar className="h-8 w-8">
                                     <AvatarImage src={image} alt={name} />
                                     <AvatarFallback>{symbol.slice(0, 2).toUpperCase()}</AvatarFallback>
                                 </Avatar>
                                 <div>
                                     <div className="text-sm font-medium">{name}</div>
                                     <div className="text-xs uppercase text-muted-foreground">{symbol}</div>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <div className="font-mono text-sm">
                                     {balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                 </div>
                                 {price > 0 && (
                                     <div className="text-xs text-muted-foreground">
                                         ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                     </div>
                                 )}
                             </div>
                         </div>
                     );
                 })}
              </div>
            ) : (
                <div className="text-sm text-muted-foreground">
                    No tokens found.
                </div>
            )}
          </CardContent>
        </Card>
      ))}
       {wallets.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No bank wallets connected.
        </div>
      )}
      <AddBankWalletDialog
        walletId={walletId}
        onWalletAdded={refreshWalletData}
      />
    </div>
  );
}

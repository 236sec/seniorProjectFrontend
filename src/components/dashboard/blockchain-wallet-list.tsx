import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlchemyChain } from "@/constants/enum/AlchemyChain";
import {
  GetWalletResponse,
  TokensMap,
} from "@/constants/types/api/getWalletTypes";
import { Utils } from "alchemy-sdk";
import { AddBlockchainWalletDialog } from "./add-blockchain-wallet-dialog";
import { SyncBlockchainWalletDialog } from "./sync-blockchain-wallet-dialog";

interface BlockchainWalletListProps {
  wallets: GetWalletResponse["wallet"]["blockchainWalletId"];
  walletId: string;
  tokensMap: TokensMap;
  refreshWalletData: () => void;
}

export function BlockchainWalletList({
  wallets,
  walletId,
  tokensMap,
  refreshWalletData,
}: BlockchainWalletListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Connected Wallets</h3>
      {wallets.map((blockchainWallet) => (
        <Card key={blockchainWallet._id}>
          <CardHeader className="pb-3">
            <div className="flex flex-row items-center justify-between">
              <div>
                <div className="space-y-1">
                  <CardTitle className="font-mono text-base">
                    {blockchainWallet.address}
                  </CardTitle>
                  <CardDescription>
                    Added on{" "}
                    {new Date(blockchainWallet.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {blockchainWallet.chains.map((chain) => (
                    <Badge key={chain} variant="secondary">
                      {chain}
                    </Badge>
                  ))}
                </div>
              </div>
              <SyncBlockchainWalletDialog
                blockchainWalletId={blockchainWallet._id}
                walletId={walletId}
                initChains={blockchainWallet.chains as AlchemyChain[]}
                onChangeSubmitting={refreshWalletData}
              />
            </div>
          </CardHeader>
          <CardContent>
            {blockchainWallet.tokens && blockchainWallet.tokens.length > 0 ? (
              <div className="space-y-2">
                {blockchainWallet.tokens.map((token) => {
                  const tokenDetails = tokensMap[token.tokenContractId.tokenId];
                  const symbol =
                    tokenDetails?.symbol || token.tokenContractId.symbol;
                  const name = tokenDetails?.name || token.tokenContractId.name;
                  const image = tokenDetails?.image?.small || "";
                  const balance = Utils.formatUnits(token.balance, 18);
                  const price = tokenDetails?.currentPrice || 0;
                  const value = parseFloat(balance) * price;

                  return (
                    <div
                      key={token.tokenContractId._id}
                      className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={image} alt={name} />
                          <AvatarFallback>
                            {symbol.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{name}</div>
                          <div className="text-xs uppercase text-muted-foreground">
                            {symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">
                          {parseFloat(balance).toLocaleString(undefined, {
                            maximumFractionDigits: 6,
                          })}
                        </div>
                        {price > 0 && (
                          <div className="text-xs text-muted-foreground">
                            $
                            {value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No on-chain tokens tracked. Use manual balances to add holdings.
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {wallets.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No blockchain wallets connected.
        </div>
      )}
      <AddBlockchainWalletDialog
        walletId={walletId}
        onWalletAdded={refreshWalletData}
      />
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AlchemyChain } from "@/constants/enum/AlchemyChain";
import {
  GetWalletResponse,
  TokensMap,
  WalletToken,
} from "@/constants/types/api/getWalletTypes";
import { Utils } from "alchemy-sdk";
import { ChevronDown } from "lucide-react";
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
    <div className="space-y-4 w-full overflow-hidden">
      <h3 className="text-lg font-semibold">Connected Wallets</h3>
      {wallets.map((blockchainWallet) => (
        <Card key={blockchainWallet._id}>
          <CardHeader className="pb-3">
            <div className="flex flex-row items-start justify-between w-full gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="font-mono text-base truncate">
                  {blockchainWallet.address}
                </CardTitle>
                <CardDescription>
                  Added on{" "}
                  {new Date(blockchainWallet.createdAt).toLocaleDateString()}
                </CardDescription>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {blockchainWallet.chains.map((chain) => (
                    <Badge key={chain} variant="secondary">
                      {chain}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <SyncBlockchainWalletDialog
                  blockchainWalletId={blockchainWallet._id}
                  walletId={walletId}
                  initChains={blockchainWallet.chains as AlchemyChain[]}
                  onChangeSubmitting={refreshWalletData}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {blockchainWallet.tokens && blockchainWallet.tokens.length > 0 ? (
              <div className="space-y-2">
                {Object.values(
                  blockchainWallet.tokens.reduce((acc, token) => {
                    const tokenId = token.tokenContractId.tokenId;
                    if (!acc[tokenId]) {
                      acc[tokenId] = [];
                    }
                    acc[tokenId].push(token);
                    return acc;
                  }, {} as Record<string, WalletToken[]>)
                ).map((group) => {
                  const firstToken = group[0];
                  const tokenId = firstToken.tokenContractId.tokenId;
                  const tokenDetails = tokensMap[tokenId];
                  const symbol =
                    tokenDetails?.symbol || firstToken.tokenContractId.symbol;
                  const name =
                    tokenDetails?.name || firstToken.tokenContractId.name;
                  const image = tokenDetails?.image?.small || "";
                  const price = tokenDetails?.currentPrice || 0;

                  // Calculate totals
                  const totalBalance = group.reduce(
                    (sum, t) =>
                      sum + parseFloat(Utils.formatUnits(t.balance, 18)),
                    0
                  );
                  const totalValue = totalBalance * price;

                  if (group.length === 1) {
                    const token = group[0];
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
                            <div className="flex items-center gap-2">
                              <div className="text-xs uppercase text-muted-foreground">
                                {symbol}
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 px-1"
                              >
                                {token.tokenContractId.chainId}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm">
                            {parseFloat(
                              Utils.formatUnits(token.balance, 18)
                            ).toLocaleString(undefined, {
                              maximumFractionDigits: 6,
                            })}
                          </div>
                          {price > 0 && (
                            <div className="text-xs text-muted-foreground">
                              $
                              {(
                                parseFloat(
                                  Utils.formatUnits(token.balance, 18)
                                ) * price
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Collapsible key={tokenId} className="group/collapsible">
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-2 hover:bg-muted/50 data-[state=open]:bg-muted/50 transition-all">
                        <div className="flex items-center gap-3">
                          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={image} alt={name} />
                            <AvatarFallback>
                              {symbol.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <div className="text-sm font-medium">{name}</div>
                            <div className="text-xs uppercase text-muted-foreground">
                              {symbol} ({group.length} networks)
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm">
                            {totalBalance.toLocaleString(undefined, {
                              maximumFractionDigits: 6,
                            })}
                          </div>
                          {price > 0 && (
                            <div className="text-xs text-muted-foreground">
                              $
                              {totalValue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-11 pr-2 space-y-2 mt-1 py-1">
                        {group.map((token) => {
                          const balance = parseFloat(
                            Utils.formatUnits(token.balance, 18)
                          );
                          const value = balance * price;

                          return (
                            <div
                              key={token.tokenContractId._id}
                              className="flex items-center justify-between text-sm py-1 border-l-2 pl-4 border-muted"
                            >
                              <Badge
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {token.tokenContractId.chainId}
                              </Badge>
                              <div className="text-right">
                                <span className="font-mono text-xs text-muted-foreground mr-3">
                                  {balance.toLocaleString(undefined, {
                                    maximumFractionDigits: 6,
                                  })}
                                </span>
                                {price > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    $
                                    {value.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
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

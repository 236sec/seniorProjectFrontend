import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GetWalletResponse } from "@/constants/types/api/getWalletTypes";
import { RefreshCw } from "lucide-react";
import { AddBlockchainWalletDialog } from "./add-blockchain-wallet-dialog";

interface BlockchainWalletListProps {
  wallets: GetWalletResponse["wallet"]["blockchainWalletId"];
  walletId: string;
  refreshWalletData: () => void;
}

export function BlockchainWalletList({
  wallets,
  walletId,
  refreshWalletData,
}: BlockchainWalletListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Connected Wallets</h3>
      {wallets.map((wallet) => (
        <Card key={wallet._id}>
          <CardHeader className="pb-3">
            <div className="flex flex-row items-center justify-between">
              <div>
                <div className="space-y-1">
                  <CardTitle className="font-mono text-base">
                    {wallet.address}
                  </CardTitle>
                  <CardDescription>
                    Added on {new Date(wallet.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {wallet.chains.map((chain) => (
                    <Badge key={chain} variant="secondary">
                      {chain}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Mock sync functionality
                  console.log("Syncing wallet:", wallet.address);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No on-chain tokens tracked. Use manual balances to add holdings.
            </div>
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

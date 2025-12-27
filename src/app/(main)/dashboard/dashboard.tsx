"use client";
import { AddBlockchainWalletDialog } from "@/components/dashboard/add-blockchain-wallet-dialog";
import { AddressBalanceChecker } from "@/components/dashboard/address-balance-checker";
import { CreateTransactionDialog } from "@/components/dashboard/create-transaction-dialog";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { WalletDisplay } from "@/components/dashboard/wallet-display";
import { WalletDropdown } from "@/components/wallet-dropdown";
import { GetUserResponse } from "@/constants/types/api/getUserTypes";
import { GetWalletResponse } from "@/constants/types/api/getWalletTypes";
import { getBaseUrl } from "@/env";
import { use, useEffect, useState } from "react";

interface DashboardProps {
  userDataPromised: Promise<GetUserResponse | undefined>;
}

async function fetchWalletData(id: string): Promise<GetWalletResponse> {
  const response = await fetch(`${getBaseUrl()}/api/users/wallets/${id}`);

  if (!response.ok) {
    throw new Error(
      "Failed to fetch wallet data with url: " +
        `${getBaseUrl()}/api/users/wallets/${id}`
    );
  }

  return await response.json();
}

export function Dashboard({ userDataPromised }: DashboardProps) {
  const userData = use(userDataPromised)!;
  const [selectedWallet, setSelectedWallet] = useState<string | null>(
    userData?.wallets?.length && userData.wallets.length > 0
      ? userData.wallets[0]._id
      : null
  );
  const [walletData, setWalletData] = useState<GetWalletResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const refreshWalletData = () => {
    if (selectedWallet) {
      setLoading(true);
      fetchWalletData(selectedWallet)
        .then((data) => {
          setWalletData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching wallet data:", error);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    refreshWalletData();
  }, [selectedWallet]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Wallets</h3>
            <div className="flex items-center gap-2">
              {selectedWallet && (
                <>
                  <AddBlockchainWalletDialog
                    walletId={selectedWallet}
                    onWalletAdded={refreshWalletData}
                  />
                  <CreateTransactionDialog
                    walletId={selectedWallet}
                    onTransactionCreated={refreshWalletData}
                  />
                </>
              )}
              <WalletDropdown
                walletData={userData?.wallets}
                selectedWallet={selectedWallet}
                setSelectedWallet={setSelectedWallet}
              />
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-8 border rounded-lg bg-muted/10">
              <div className="text-muted-foreground">
                Loading wallet data...
              </div>
            </div>
          )}

          {!loading && walletData && (
            <>
              <WalletDisplay walletData={walletData} />
              <TransactionHistory transactions={walletData.transactions} />
            </>
          )}
        </div>
        <div>
          <AddressBalanceChecker />
        </div>
      </div>
    </div>
  );
}

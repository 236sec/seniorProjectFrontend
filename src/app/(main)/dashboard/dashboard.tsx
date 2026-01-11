"use client";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { WalletDisplay } from "@/components/dashboard/wallet-display";
import { WalletDropdown } from "@/components/dashboard/wallet-dropdown";
import { GetUserResponse } from "@/constants/types/api/getUserTypes";
import { GetWalletTransactionsResponse } from "@/constants/types/api/getWalletTransactionsTypes";
import { GetWalletResponse } from "@/constants/types/api/getWalletTypes";
import { getBaseUrl } from "@/env";
import { use, useEffect, useState } from "react";

interface DashboardProps {
  userDataPromised: Promise<GetUserResponse | undefined>;
  walletId?: string;
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

export function Dashboard({ userDataPromised, walletId }: DashboardProps) {
  const userData = use(userDataPromised)!;
  const selectedWallet = walletId || null;
  const [walletData, setWalletData] = useState<GetWalletResponse | null>(null);
  const [transactionsData, setTransactionsData] =
    useState<GetWalletTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [isShowTransactions, setIsShowTransactions] = useState(false);

  const fetchTransactions = async (
    walletId: string,
    limit = 10,
    offset = 0
  ) => {
    try {
      setTransactionsLoading(true);
      const response = await fetch(
        `${getBaseUrl()}/api/wallets/transactions/${walletId}?limit=${limit}&offset=${offset}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data: GetWalletTransactionsResponse = await response.json();
      setTransactionsData(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const refreshWalletData = () => {
    if (selectedWallet) {
      setLoading(true);
      setTransactionsLoading(true);

      fetchWalletData(selectedWallet)
        .then((data) => {
          setWalletData(data);
        })
        .catch((error) => {
          console.error("Error fetching wallet data:", error);
        })
        .finally(() => {
          setLoading(false);
        });

      // Fetch transactions separately
      setIsShowTransactions(true);
      fetchTransactions(selectedWallet);
    }
  };

  useEffect(() => {
    setIsShowTransactions(false);
    refreshWalletData();
  }, [selectedWallet]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <WalletDropdown
                walletData={userData?.wallets}
                selectedWallet={selectedWallet}
              />
            </div>
          </div>

          <WalletDisplay
            walletData={walletData}
            loading={loading}
            refreshWalletData={refreshWalletData}
          />
          {isShowTransactions && (
            <TransactionHistory
              transactionsData={transactionsData}
              loading={transactionsLoading}
              onPageChange={(limit, offset) => {
                if (selectedWallet) {
                  fetchTransactions(selectedWallet, limit, offset);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

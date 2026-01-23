"use client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { WalletDisplay } from "@/components/dashboard/wallet-display";
import { WalletDropdown } from "@/components/dashboard/wallet-dropdown";
import { Button } from "@/components/ui/button";
import { GetUserResponse } from "@/constants/types/api/getUserTypes";
import { GetWalletTransactionsResponse } from "@/constants/types/api/getWalletTransactionsTypes";
import { GetWalletResponse } from "@/constants/types/api/getWalletTypes";
import { getBaseUrl } from "@/env";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
        `${getBaseUrl()}/api/users/wallets/${id}`,
    );
  }

  return await response.json();
}

export function Dashboard({ userDataPromised, walletId }: DashboardProps) {
  const router = useRouter();
  const userData = use(userDataPromised)!;
  const selectedWallet = walletId || null;
  const [walletData, setWalletData] = useState<GetWalletResponse | null>(null);
  const [transactionsData, setTransactionsData] =
    useState<GetWalletTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [isShowTransactions, setIsShowTransactions] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteWallet = async () => {
    if (!selectedWallet) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${getBaseUrl()}/api/wallets/${selectedWallet}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await response.json();
        console.error(
          "Failed to delete wallet:",
          data.error || "Unknown error",
        );
      }
    } catch (error) {
      console.error("Error deleting wallet:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchTransactions = async (
    walletId: string,
    limit = 10,
    offset = 0,
  ) => {
    try {
      setTransactionsLoading(true);
      const response = await fetch(
        `${getBaseUrl()}/api/wallets/transactions/${walletId}?limit=${limit}&offset=${offset}`,
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
            {selectedWallet && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={loading || isDeleting}
                title="Delete Wallet"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
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
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Wallet"
        description="Are you sure you want to delete this wallet? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteWallet}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}

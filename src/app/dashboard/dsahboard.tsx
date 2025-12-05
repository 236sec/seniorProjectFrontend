"use client";
import { WalletDropdown } from "@/components/wallet-dropdown";
import { GetUserResponse } from "@/constants/types/api/getUserTypes";
import { GetWalletResponse } from "@/constants/types/api/getWalletTypes";
import { env } from "@/env";
import { use, useEffect, useState } from "react";

interface DashboardProps {
  userDataPromised: Promise<GetUserResponse | undefined>;
}

async function fetchWalletData(id: string): Promise<GetWalletResponse> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_FRONTEND_URL}/api/users/wallets/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch wallet data");
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

  useEffect(() => {
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
  }, [selectedWallet]);

  return (
    <div className="space-y-4">
      <WalletDropdown
        walletData={userData.wallets}
        selectedWallet={selectedWallet}
        setSelectedWallet={setSelectedWallet}
      />

      {loading && <div>Loading wallet data...</div>}

      {!loading && walletData && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Wallet Details</h3>
          <pre className="text-sm bg-muted p-2 rounded">
            {JSON.stringify(walletData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

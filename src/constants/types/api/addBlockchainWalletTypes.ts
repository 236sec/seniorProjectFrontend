export interface AddBlockchainWalletRequest {
  walletId: string;
  address: string;
  chains: string[];
}

export interface AddBlockchainWalletResponse {
  _id: string;
  address: string;
  chains: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

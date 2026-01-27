export interface AddBankWalletParams {
  walletId: string;
  apiKey: string;
  apiSecret: string;
}

export interface AddBankWalletResponse {
  walletId: string;
  apiKey: string;
  apiSecret: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

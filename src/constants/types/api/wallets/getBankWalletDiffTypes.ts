export interface GetBankWalletDiffParams {
  bankWalletId: string;
}

export interface BankWalletDiffDetail {
  contractAddress: string;
  balance: string;
  balanceFormatted: string;
  walletBalance: string;
  walletBalanceFormatted: string;
  symbol: string;
  name: string;
  logo: string;
  decimals: number | null;
  network: string;
  token: {
    id: string;
    symbol: string;
    name: string;
    image: {
      thumb: string;
      small: string;
      large: string;
      _id: string;
    };
  };
  currentPrice: number;
}

export interface GetBankWalletDiffResponse {
  walletId: string;
  totalTokens: number;
  differences: BankWalletDiffDetail[];
}

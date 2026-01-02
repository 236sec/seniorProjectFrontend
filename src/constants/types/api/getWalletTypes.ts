export interface TokenDetails {
  _id: string;
  id: string;
  name: string;
  symbol: string;
  image: {
    thumb: string;
    small: string;
    large: string;
    _id: string;
  };
  currentPrice: number;
  priceChange24h: number | null;
}

export interface BlockchainWallet {
  _id: string;
  address: string;
  chains: string[];
  tokens: never[]; // Empty array in the new API
  createdAt: string;
  updatedAt: string;
}

export interface ManualTokenBalance {
  tokenId: string; // Reference to token ID (not populated)
  balance: string;
}

export interface PortfolioPerformance {
  tokenId: string;
  totalInvestedAmount: number;
  totalBalance: string;
  totalCashflowUsd: number;
}

export interface Wallet {
  _id: string;
  userId: string;
  name: string;
  description: string;
  blockchainWalletId: BlockchainWallet[];
  manualTokens: ManualTokenBalance[];
  portfolioPerformance: PortfolioPerformance[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TokensMap {
  [tokenId: string]: TokenDetails;
}

export interface GetWalletResponse {
  wallet: Wallet;
  tokens: TokensMap;
}

export interface GetWalletParams {
  id: string;
}

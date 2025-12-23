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
}

export interface TokenContract {
  _id: string;
  tokenId: TokenDetails;
  coinGeckoId: string;
  chainId: string;
  contractAddress: string;
  symbol: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TokenBalance {
  tokenContractId: TokenContract;
  balance: string;
}

export interface ManualTokenBalance {
  tokenId: TokenDetails;
  balance: string;
}

export interface BlockchainWallet {
  _id: string;
  address: string;
  chains: string[];
  tokens: TokenBalance[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetWalletResponse {
  _id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  blockchainWalletId: BlockchainWallet[];
  manualTokens: ManualTokenBalance[];
}

export interface GetWalletParams {
  id: string;
}

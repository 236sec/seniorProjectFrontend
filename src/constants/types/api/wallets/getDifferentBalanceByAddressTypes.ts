export interface TokenImage {
  thumb: string;
  small: string;
  large: string;
  _id: string;
}

export interface TokenMetadata {
  id: string;
  symbol: string;
  name: string;
  image: TokenImage;
}

export interface TokenDifference {
  tokenContractId: string;
  contractAddress: string;
  balance: string; // hex format
  balanceFormatted: string; // formatted value
  walletBalance: string; // hex format
  walletBalanceFormatted: string; // formatted value
  symbol: string;
  name: string;
  logo: string;
  decimals: number | null;
  network: string;
  token: TokenMetadata | null;
  currentPrice: number | null;
}

export interface GetDifferentBalanceByAddressParams {
  walletId: string;
  address: string;
}

export interface GetDifferentBalanceByAddressResponse {
  address: string;
  chains: string[];
  totalTokens: number;
  tokensWithDifferences: number;
  differences: TokenDifference[];
}

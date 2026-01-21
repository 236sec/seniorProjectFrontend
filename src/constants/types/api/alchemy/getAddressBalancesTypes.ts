export interface GetAddressBalancesParams {
  address: string;
  chains?: string[];
}

export interface NativeBalanceData {
  contractAddress: string;
  network: string;
  balance: string;
  balanceFormatted: string;
  token: {
    id: string;
    symbol: string;
    name: string;
    image: {
      thumb: string;
      small: string;
      large: string;
    };
  };
}

export interface TokenBalanceData {
  contractAddress: string;
  balance: string;
  balanceFormatted: string;
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
    };
  };
}

export interface GetAddressBalancesResponse {
  address: string;
  chains: string[];
  nativeBalances: NativeBalanceData[];
  balances: TokenBalanceData[];
  totalTokens: number;
  tokensWithMetadata: number;
}

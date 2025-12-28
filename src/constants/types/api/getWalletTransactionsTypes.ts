export interface GetWalletTransactionsParams {
  walletId: string;
  limit?: number;
  offset?: number;
}

export interface TokenImage {
  thumb: string;
  small: string;
  large: string;
}

export interface PopulatedToken {
  _id: string;
  id: string;
  symbol: string;
  name: string;
  image?: TokenImage;
}

export interface Transaction {
  _id: string;
  walletId: string;
  tokenId?: PopulatedToken;
  tokenContractId?: string;
  blockchainWalletId?: string;
  type: "SYNCED" | "MANUAL";
  event_type: "DEPOSIT" | "WITHDRAWAL";
  quantity: string;
  timestamp: string;
  txHash?: string;
  note?: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  offset: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetWalletTransactionsResponse {
  data: Transaction[];
  pagination: PaginationMetadata;
}

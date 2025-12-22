export enum TransactionType {
  MANUAL = "MANUAL",
  SYNCED = "SYNCED",
}

export enum TransactionEventType {
  SWAP = "SWAP",
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
}

export interface CreateTransactionRequest {
  walletId: string;
  type: TransactionType;
  blockchainWalletId?: string;
  tokenContractId?: string;
  event_type?: TransactionEventType;
  quantity?: string;
  from?: string;
  to?: string;
  price_usd?: number;
  cashflow_usd?: number;
}

export interface CreateTransactionResponse {
  _id: string;
  walletId: string;
  type: TransactionType;
  event_type?: TransactionEventType;
  quantity?: string;
  createdAt: string;
  updatedAt: string;
}

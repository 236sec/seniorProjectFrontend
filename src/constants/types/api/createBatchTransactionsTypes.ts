import {
  TransactionEventType,
  TransactionType,
} from "./createTransactionTypes";

export interface BatchTransactionItem {
  type: TransactionType.SYNCED;
  blockchainWalletId: string;
  tokenContractId: string;
  event_type: TransactionEventType;
  quantity?: string; // hex string
  from?: string;
  to?: string;
  price_usd?: number;
  cashflow_usd?: number;
  timestamp: string; // Date string
}

export interface CreateBatchTransactionsParams {
  walletId: string;
  items: BatchTransactionItem[];
}

export interface CreateBatchTransactionsResponseItem {
  _id: string;
  walletId: string;
  type: TransactionType;
  event_type?: TransactionEventType;
  quantity?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateBatchTransactionsResponse =
  CreateBatchTransactionsResponseItem[];

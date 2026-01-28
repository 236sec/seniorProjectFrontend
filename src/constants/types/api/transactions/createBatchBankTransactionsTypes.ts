import {
    TransactionEventType,
    TransactionType,
} from "../createTransactionTypes";

export interface BatchBankTransactionItem {
  bankWalletId: string;
  type: TransactionType;
  event_type: TransactionEventType;
  tokenId: string;
  quantity: string;
  price_usd: number;
  cashflow_usd: number;
  timestamp: string;
}

export interface CreateBatchBankTransactionsParams {
  walletId: string;
  items: BatchBankTransactionItem[];
}

export interface CreateWalletRequest {
  params: CreateWalletRequestParams;
  body: CreateWalletRequestBody;
}

export interface CreateWalletRequestParams {
  userId: string;
}

export interface CreateWalletRequestBody {
  name: string;
  description?: string;
}

export interface CreateWalletResponse {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  blockchainWalletId: string[];
  //   manualTokens: any[];
  // portfolioPerformance: any[];
  createdAt: string;
  updatedAt: string;
}

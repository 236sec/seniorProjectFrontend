export interface GetWalletParams {
  id: string;
}

export interface GetWalletResponse {
  _id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

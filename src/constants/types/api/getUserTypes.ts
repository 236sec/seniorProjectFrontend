export interface GetUserParams {
  id: string;
}

export interface UserWallet {
  _id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserResponse {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  wallets?: UserWallet[];
}

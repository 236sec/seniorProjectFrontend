import { AlchemyChain } from "@/constants/enum/AlchemyChain";

export interface UpdateBlockchainWalletParams {
  blockchainWalletId: string;
  chains: AlchemyChain[];
}

export interface UpdateBlockchainWalletResponse {
  _id: string;
}

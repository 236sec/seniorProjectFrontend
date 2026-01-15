export enum AlchemyChain {
  // Mainnet chains
  ETHEREUM_MAINNET = "eth-mainnet",
  OP_MAINNET = "opt-mainnet",
  POLYGON_POS_MAINNET = "polygon-mainnet",
  ARBITRUM_MAINNET = "arb-mainnet",
  BASE_MAINNET = "base-mainnet",
  WORLDCHAIN_MAINNET = "worldchain-mainnet",
  ZKSYNC_MAINNET = "zksync-mainnet",
  BERACHAIN_MAINNET = "berachain-mainnet",
  LINEA_MAINNET = "linea-mainnet",
  INK_MAINNET = "ink-mainnet",

  // Sepolia testnet
  ETHEREUM_SEPOLIA = "eth-sepolia",
}

export const CHAIN_DISPLAY_NAMES: Record<AlchemyChain, string> = {
  [AlchemyChain.ETHEREUM_MAINNET]: "Ethereum",
  [AlchemyChain.OP_MAINNET]: "Optimism",
  [AlchemyChain.POLYGON_POS_MAINNET]: "Polygon",
  [AlchemyChain.ARBITRUM_MAINNET]: "Arbitrum",
  [AlchemyChain.BASE_MAINNET]: "Base",
  [AlchemyChain.ETHEREUM_SEPOLIA]: "Ethereum Sepolia",
  [AlchemyChain.WORLDCHAIN_MAINNET]: "Worldchain",
  [AlchemyChain.ZKSYNC_MAINNET]: "ZkSync",
  [AlchemyChain.BERACHAIN_MAINNET]: "Berachain",
  [AlchemyChain.LINEA_MAINNET]: "Linea",
  [AlchemyChain.INK_MAINNET]: "Ink",
};

export const AVAILABLE_CHAINS = Object.values(AlchemyChain);

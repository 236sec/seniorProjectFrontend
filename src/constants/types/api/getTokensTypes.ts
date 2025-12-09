export interface TokenImage {
  thumb: string;
  small: string;
  large: string;
}

export interface TokenItem {
  _id: string;
  id: string;
  symbol: string;
  name: string;
  image?: TokenImage;
}

export interface TokenPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetTokensParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetTokensResponse {
  data: TokenItem[];
  pagination: TokenPagination;
}

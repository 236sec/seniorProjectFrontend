export interface CommonErrorResponse {
  response: {
    message: string;
    error: string;
    statusCode: number;
  };
  status: number;
  options?: RequestInit;
  message: string;
  name: string;
}

export interface ErrorService {
  error: string;
}

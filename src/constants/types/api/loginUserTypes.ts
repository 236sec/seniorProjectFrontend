export interface LoginUserRequest {
  email: string;
  provider: string;
}

export interface LoginUserResponse {
  id: string;
  email: string;
}

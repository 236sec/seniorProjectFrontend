export interface LoginUserRequest {
  email: string;
  provider: string;
}

export interface LoginUserResponse {
  _id: string;
  email: string;
}

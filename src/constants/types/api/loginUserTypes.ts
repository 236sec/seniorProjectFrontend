export interface LoginUserRequest {
  email: string;
  provider: string;
  firstName: string;
  lastName: string;
}

export interface LoginUserResponse {
  _id: string;
  email: string;
}

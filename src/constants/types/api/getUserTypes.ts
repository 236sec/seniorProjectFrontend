export interface GetUserParams {
  id: string;
}

export interface GetUserResponse {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
}

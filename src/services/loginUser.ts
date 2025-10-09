import {
  LoginUserRequest,
  LoginUserResponse,
} from "@/constants/types/api/loginUserTypes";

export async function loginUser(
  data: LoginUserRequest
): Promise<LoginUserResponse | undefined> {
  const response = await fetch(`${process.env.BACKEND_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    const data = (await response.json()) as LoginUserResponse;
    return data;
  }
}

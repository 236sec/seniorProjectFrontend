import {
  LoginUserRequest,
  LoginUserResponse,
} from "@/constants/types/api/loginUserTypes";
import { env } from "@/env";

export async function loginUser(
  data: LoginUserRequest
): Promise<LoginUserResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(`${backendUrl}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = (await response.json()) as LoginUserResponse;
      return responseData;
    } else {
      console.error(
        `Login failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Login user fetch failed:", error);
    return undefined;
  }
}

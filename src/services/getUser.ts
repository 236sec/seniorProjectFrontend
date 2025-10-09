import {
  GetUserParams,
  GetUserResponse,
} from "@/constants/types/api/getUserTypes";

export async function getUser(
  data: GetUserParams
): Promise<GetUserResponse | undefined> {
  const response = await fetch(`${process.env.BACKEND_URL}/users/${data.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    const data = (await response.json()) as GetUserResponse;
    return data;
  }
}

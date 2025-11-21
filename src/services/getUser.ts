import {
  GetUserParams,
  GetUserResponse,
} from "@/constants/types/api/getUserTypes";

export async function getUser(
  data: GetUserParams
): Promise<GetUserResponse | undefined> {
  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL environment variable is not set");
      return undefined;
    }

    const response = await fetch(`${backendUrl}/users/${data.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const responseData = (await response.json()) as GetUserResponse;
      return responseData;
    } else {
      console.error(
        `Get user failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    console.error("Get user fetch failed:", error);
    return undefined;
  }
}

import {
  GetWalletParams,
  GetWalletResponse,
} from "@/constants/types/api/getWalletTypes";
import { env } from "@/env";

export async function getWallet(
  data: GetWalletParams
): Promise<GetWalletResponse | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(`${backendUrl}/wallets/${data.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const responseData = (await response.json()) as GetWalletResponse;
      return responseData;
    } else {
      console.error(
        `Get wallet failed with status: ${response.status} ${response.statusText}`
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

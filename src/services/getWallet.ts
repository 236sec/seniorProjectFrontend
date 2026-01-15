import { ErrorService } from "@/constants/types/api/commonErrorTypes";
import {
  GetWalletParams,
  GetWalletResponse,
} from "@/constants/types/api/getWalletTypes";
import { env } from "@/env";

export async function getWallet(
  data: GetWalletParams
): Promise<GetWalletResponse | ErrorService | undefined> {
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
      try {
        const errorResponseData = await response.json();
        console.error(
          `Get wallet failed with status: ${response.status} ${response.statusText}`
        );
        if (
          errorResponseData &&
          typeof errorResponseData === "object" &&
          "response" in errorResponseData &&
          errorResponseData.response?.message
        ) {
          console.error(`Error message: ${errorResponseData.response.message}`);
          return { error: errorResponseData.response.message };
        } else {
          console.error("Error details:", errorResponseData);
        }
      } catch {
        console.error(
          `Get wallet failed with status: ${response.status} ${response.statusText}`
        );
      }
      return { error: "Unknown error occurred" };
    }
  } catch (error) {
    console.error("Get wallet fetch failed:", error);
    return { error: "Fetch failed" };
  }
}

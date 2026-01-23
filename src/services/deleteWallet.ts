"use server";

import { ErrorService } from "@/constants/types/api/commonErrorTypes";
import {
  DeleteWalletParams,
  DeleteWalletResponse,
} from "@/constants/types/api/deleteWalletTypes";
import { env } from "@/env";

export async function deleteWallet(
  data: DeleteWalletParams,
): Promise<DeleteWalletResponse | ErrorService | undefined> {
  try {
    const backendUrl = env.BACKEND_URL;

    const response = await fetch(`${backendUrl}/wallets/${data.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      if (response.status === 204) {
        return { message: "Wallet deleted successfully" };
      }
      const responseData = (await response.json()) as DeleteWalletResponse;
      return responseData;
    } else {
      try {
        const errorResponseData = await response.json();
        console.error(
          `Delete wallet failed with status: ${response.status} ${response.statusText}`,
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
          `Delete wallet failed with status: ${response.status} ${response.statusText}`,
        );
      }
      return { error: "Unknown error occurred" };
    }
  } catch (error) {
    console.error("Delete wallet fetch failed:", error);
    return { error: "Fetch failed" };
  }
}

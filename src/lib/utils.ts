import { ErrorService } from "@/constants/types/api/commonErrorTypes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString().slice(0, 16);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isErrorService(obj: any): obj is ErrorService {
  return (
    obj &&
    typeof obj === "object" &&
    "error" in obj &&
    typeof obj.error === "string"
  );
}

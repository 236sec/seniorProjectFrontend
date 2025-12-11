import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_GITHUB_ID: z.string().min(1).optional(),
    AUTH_GITHUB_SECRET: z.string().min(1).optional(),
    AUTH_SECRET: z.string().min(1),
    COINGECKO_API_URL: z.url(),
    COINGECKO_DEMO_API_KEY: z.string().min(1).optional(),
    BACKEND_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string().min(1),
    NEXT_PUBLIC_FRONTEND_URL: z.string().min(1),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    COINGECKO_API_URL: process.env.COINGECKO_API_URL,
    COINGECKO_DEMO_API_KEY: process.env.COINGECKO_DEMO_API_KEY,
    BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  },
});

/**
 * Get the base URL with protocol for making API requests.
 * Handles cases where NEXT_PUBLIC_VERCEL_URL may or may not include protocol.
 */
export function getBaseUrl(): string {
  if (env.NEXT_PUBLIC_FRONTEND_URL) {
    return env.NEXT_PUBLIC_FRONTEND_URL;
  }
  const baseUrl = env.NEXT_PUBLIC_VERCEL_URL;

  // If already has protocol, return as-is
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    return baseUrl;
  }

  // Add protocol based on environment
  if (baseUrl.includes("localhost") || baseUrl.startsWith("127.0.0.1")) {
    return `http://${baseUrl}`;
  }

  return `https://${baseUrl}`;
}

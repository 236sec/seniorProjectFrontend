import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_GITHUB_ID: z.string().min(1).optional(),
    AUTH_GITHUB_SECRET: z.string().min(1).optional(),
    AUTH_SECRET: z.string().min(1),
    ALCHEMY_API_KEY: z.string().min(1),
    COINGECKO_API_URL: z.url(),
    COINGECKO_DEMO_API_KEY: z.string().min(1).optional(),
    BACKEND_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_FRONTEND_URL: z.url(),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    COINGECKO_API_URL: process.env.COINGECKO_API_URL,
    COINGECKO_DEMO_API_KEY: process.env.COINGECKO_DEMO_API_KEY,
    BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  },
});

import { User } from "@/constants/types/userTypes";
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      first_name: string;
      last_name: string;
      image?: string | null;
      email: string;
      _id: string;
    } & DefaultSession["user"];
  }
}

import "next-auth/jwt";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    user: User;
  }
}

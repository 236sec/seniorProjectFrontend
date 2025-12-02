import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { getUser } from "./services/getUser";
import { loginUser } from "./services/loginUser";

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [GitHub, Google],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user || !user.email) {
          console.error("No user or email provided in signIn callback");
          return false;
        }

        const data = await loginUser({
          email: user.email,
          provider: account!.provider,
        });
        if (!data) {
          console.error("Failed to login user - no data returned");
          return "/unauthorized";
        }

        user.id = data._id;
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user && user.id) {
          const data = await getUser({ id: user.id });
          if (!data) {
            console.warn("Failed to fetch user data for JWT token");
            return token;
          }
          token.user = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            _id: data._id,
          };
        }
        return token;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token && token.user) {
          session.user._id = token.user._id;
          session.user.first_name = token.user.first_name;
          session.user.last_name = token.user.last_name;
          session.user.email = token.user.email;
        }
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
  },
});

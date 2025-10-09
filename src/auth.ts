import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { getUser } from "./services/getUser";
import { loginUser } from "./services/loginUser";

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [GitHub],
  callbacks: {
    async signIn({ user }) {
      if (!user) return false;
      const data = await loginUser({ email: user.email! });
      if (!data) return false;
      user.id = data.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const data = await getUser({ id: user.id! });
        if (!data) return token;
        token.user = {
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          id: data.id,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.user) {
        session.user.id = token.user.id;
        session.user.firstName = token.user.firstName;
        session.user.lastName = token.user.lastName;
        session.user.email = token.user.email;
      }
      return session;
    },
  },
});

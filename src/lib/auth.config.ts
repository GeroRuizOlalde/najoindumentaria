import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize() {
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

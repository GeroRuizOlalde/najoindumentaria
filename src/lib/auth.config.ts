// src/lib/auth.config.ts
import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/generated/prisma/client";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isLoginPage = request.nextUrl.pathname === "/login";
      const isAuthenticated = !!auth?.user;

      if (isAdminRoute && !isAuthenticated) {
        return Response.redirect(new URL("/login", request.nextUrl));
      }

      if (isLoginPage && isAuthenticated) {
        return Response.redirect(new URL("/admin", request.nextUrl));
      }

      return true;
    },
  },
  providers: [], // Lo dejamos vacío acá a propósito
} satisfies NextAuthConfig;
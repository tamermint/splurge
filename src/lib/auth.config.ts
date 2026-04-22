//See https://authjs.dev/getting-started/migrating-to-v5#authenticating-server-side
// There is an issue being tracked with the non-compatibility of Prisma client for Edge runtime - https://github.com/prisma/prisma/issues/20560
// Idea here is to split the config for edge runtime access vs normal db access. Edge runtime access is necessary for proxy.ts to run
// and intercept routes
//This is the edge runtime safe config

import Google from "next-auth/providers/google";
import type { NextAuthConfig, DefaultSession } from "next-auth";
import { Plan } from "@/generated/prisma/enums";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: Plan | "FREE" | "PRO";
    } & DefaultSession["user"];
  }

  interface User {
    plan?: Plan | "FREE" | "PRO";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    plan: Plan | "FREE" | "PRO";
  }
}

export default {
  providers: [Google],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.plan = user.plan || "FREE";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.plan = token.plan as Plan | "FREE" | "PRO";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

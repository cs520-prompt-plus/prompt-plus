import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

const prisma = new PrismaClient();

export const authConfig = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    // ...add more providers here
  ],
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXT_AUTH_SECRET,
};

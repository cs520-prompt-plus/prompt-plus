import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt", // ✅ must be 'jwt'
  },
  jwt: {
    encryption: true,
    algorithms: ["A256GCM"], // symmetric
    secret: process.env.NEXT_AUTH_SECRET,
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXT_AUTH_SECRET,
};

import { authConfig } from "@/lib/auth";
import NextAuth from "next-auth";

const myHandler = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
});

export { myHandler as GET, myHandler as POST };

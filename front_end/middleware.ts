import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes("auth")) {
    return NextResponse.next();
  }
  if (process.env.NODE_ENV === "development") {
    const { nextUrl } = request;
    const url = nextUrl.clone();

    console.log("middleware", url.pathname);
    if (url.pathname.startsWith("/api")) {
      url.hostname = "127.0.0.1";
      url.protocol = "http:";
      url.port = "8000";
      return NextResponse.rewrite(url);
    }
  }
  return NextResponse.next();
}

export default withAuth(middleware, {
  callbacks: {
    authorized: ({ token }) => token?.role === "admin",
  },
  secret: process.env.NEXT_AUTH_SECRET,
});

export const config = {
  matcher: "/api/:path*",
};

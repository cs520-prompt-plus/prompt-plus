import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const reservePaths = ["auth", "chat", "echo"];
export async function middleware(request: NextRequest) {
  console.log("middleware", request.nextUrl.pathname);
  if (
    reservePaths.some((path) => request.nextUrl.pathname.includes(`/${path}`))
  ) {
    return NextResponse.next();
  }
  if (process.env.NODE_ENV === "development") {
    const { nextUrl } = request;
    const url = nextUrl.clone();

    console.log("middleware", url.pathname);
    if (url.pathname.startsWith("/api")) {
      url.hostname = "back_end";
      url.protocol = "http:";
      url.port = process.env.UVICORN_PORT || "80";
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

import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime (no 60s Edge timeout)
export const runtime = "nodejs";

// Backend origin (no trailing slash)
const BACKEND = (() => {
  const host = process.env.FASTAPI_HOST || "back_end";
  const port = process.env.FASTAPI_PORT || "80";
  return `http://${host}:${port}`;
})();

// Core proxy logic
async function proxy(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const { params } = await context;
  const { path } = await params;
  console.log("Proxying request:", request.method, path);

  const forwardPath = "/" + path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND}${forwardPath}${search}`;

  // Clone headers and strip hop-by-hop
  const headers = new Headers(request.headers);
  [
    "connection",
    "keep-alive",
    "proxy-authorization",
    "proxy-authenticate",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
  ].forEach((h) => headers.delete(h));

  // Handle body for non-GET/HEAD
  let body: string | undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    const ct = headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      body = JSON.stringify(await request.json());
    } else {
      body = await request.text();
    }
  }

  // 5-minute timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 300_000);

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timer);

    // Strip hop-by-hop from response
    const resHeaders = new Headers(upstream.headers);
    resHeaders.delete("transfer-encoding");

    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      return new NextResponse("Upstream timed out", { status: 504 });
    }
    console.error("Proxy error:", err);
    return new NextResponse(`Proxy failure: ${err.message}`, { status: 500 });
  }
}

// Export each method as an async handler so path is ready
export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxy(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxy(request, context);
}

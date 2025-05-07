import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime (no 60s Edge timeout)
export const runtime = "nodejs";

// Backend origin (no trailing slash)
const BACKEND = (() => {
  const host = process.env.FASTAPI_HOST || "back_end";
  const port = process.env.FASTAPI_PORT || "80";
  return `http://${host}:${port}`;
})();

// Core proxy handler for all HTTP methods
async function proxy(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // reconstruct path: params.path = ["api", "v1", "responses"] etc.
  const forwardPath = "/" + params.path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND}${forwardPath}${search}`;

  // Prepare headers: clone + remove hop-by-hop
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

  // Read and forward body for POST/PUT/PATCH
  let body: any = undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    const contentType = headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await request.json();
      body = JSON.stringify(json);
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

    // Read full body
    const arrayBuffer = await upstream.arrayBuffer();
    return new NextResponse(arrayBuffer, {
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

// Export for all methods
export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};

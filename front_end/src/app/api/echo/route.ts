// File: app/api/echo/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  return NextResponse.json({
    message: "Received your data!",
    data: body,
  });
}

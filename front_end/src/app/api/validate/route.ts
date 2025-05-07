import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Run on Node.js runtime so we can call OpenAI
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  // System instruction: respond with structured JSON including valid, reason, feedback
  const systemMessage = {
    role: "system" as const,
    content: [
      "You are a prompt validator assistant.",
      "Prompt can be minimal: only invalidate when it's truly empty or contains harmful/malicious content.",
      "Favor valid=true for any non-empty, non-malicious input.",
      "Always respond with a JSON object: { valid: boolean, reason: string, feedback: string }.",
      "If valid=true, feedback may offer optional enhancements; if valid=false, reason explains why and feedback suggests a fix.",
    ].join(" "),
  };
  const userMessage = { role: "user" as const, content: prompt };

  try {
    // Use generateObject to enforce JSON structure with Zod schema
    const { object: validation } = await generateObject({
      model: openai.chat("gpt-4o"),
      messages: [systemMessage, userMessage],
      schema: z.object({
        valid: z.boolean(),
        reason: z.string(),
        feedback: z.string(),
      }),
      temperature: 0,
      maxTokens: 150,
    });

    return NextResponse.json(validation);
  } catch (err: any) {
    console.error("Validation service error:", err);
    return NextResponse.json(
      { valid: false, reason: "Validation service unavailable.", feedback: "" },
      { status: 500 }
    );
  }
}

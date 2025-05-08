// app/api/gen/route.ts
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userInput } = await req.json();

  if (typeof userInput !== "string" || userInput.trim() === "") {
    return NextResponse.json("Invalid input", { status: 400 });
  }

  const systemMessage = {
    role: "system" as const,
    content: [
      "You are a prompt generator.",
      "Based on a user's natural language input, return a clear and effective AI prompt tailored to their goal.",
      "Do not include any extra text—just return the prompt string.",
    ].join(" "),
  };

  const userMessage = { role: "user" as const, content: userInput };

  try {
    const { object } = await generateObject({
      model: openai.chat("gpt-4o"),
      messages: [systemMessage, userMessage],
      schema: z.object({
        prompt: z.string(),
      }),
      temperature: 0.8,
      maxTokens: 150,
    });

    return NextResponse.json(object.prompt);
  } catch (err) {
    console.error("Prompt generation error:", err);
    return NextResponse.json("Failed to generate prompt", { status: 500 });
  }
}

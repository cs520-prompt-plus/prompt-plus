import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const system_prompt = `Rewrite the prompt above with this added instruction: `

  for (const msg of messages) {
    if (msg.role === "user") {
      if (typeof msg.content === "string") {
        msg.content = `${system_prompt}${msg.content}`;
      } else if (Array.isArray(msg.parts)) {
        msg.content = `${system_prompt}\n\n${msg.parts.map((p: any) => p?.text || "").join(" ")}`;
        delete msg.parts;
      }
      break; // only modify the first user message
    }
  }

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  });
}
export function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

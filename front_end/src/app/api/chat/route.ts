import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages: userMessages } = await req.json();

  const systemMessage = {
    role: "system",
    content: [
      "You are a prompt-refinement assistant.",
      "When you reply, output *only* the improved prompt, as a single plain-text paragraph.",
      "Keep the original idea and roughly the same length—unless the user specifically asks for it to be shorter or more concise.",
      "Make the prompt as clear and precise as possible, adapting to any user‐stated preferences.",
      "Do not include any explanations, quotes, bullets or metadata—just the new prompt itself.",
    ].join(" "),
  };

  const messages = [systemMessage, ...userMessages];

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

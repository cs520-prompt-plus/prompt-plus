"use client";

import { Chat } from "@/components/ui/chat";
import { Message } from "@/components/ui/chat-message";
import { cn } from "@/lib/utils";
import {
  Message as UIMessage,
  useChat,
  type UseChatOptions,
} from "@ai-sdk/react";

type MessagePart =
  | { type: "text"; text: string }
  | { type: "reasoning"; reasoning: string }
  | { type: "tool-invocation"; toolInvocation: any }
  | { type: "source" };

type ChatDemoProps = {
  initialMessages?: UseChatOptions["initialMessages"];
  model: string;
};

export function ChatDemo(props: ChatDemoProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    status,
    setMessages,
  } = useChat({
    ...props,
    api: "/api/chat",
    body: {
      model: props.model,
    },
  });

  return (
    <div className={cn("flex", "flex-col", "h-full", "w-full")}>
      <Chat
        className="grow"
        messages={toMessages(messages)}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={status === "submitted"}
        stop={stop}
        append={append}
        setMessages={setMessages}
        // transcribeAudio={transcribeAudio}
        // suggestions={[
        //   "Refine to be more specific",
        //   "Make it more concise",
        //   "Add more context",
        // ]}
      />
    </div>
  );
}

// Convert each part individually
function convertUIPart(
  part: NonNullable<UIMessage["parts"]>[number]
): MessagePart | null {
  switch (part.type) {
    case "text":
      return { type: "text", text: part.text };
    case "reasoning":
      return { type: "reasoning", reasoning: part.reasoning };
    case "tool-invocation":
      return { type: "tool-invocation", toolInvocation: part.toolInvocation };
    case "source":
      return { type: "source" };
    case "step-start":
      return null;
    default:
      throw new Error("Unsupported UI part: " + (part as any).type);
  }
}

export function toMessage(uiMsg: UIMessage): Message {
  return {
    id: uiMsg.id,
    role: uiMsg.role,
    content: uiMsg.content,
    createdAt: uiMsg.createdAt,
    experimental_attachments: uiMsg.experimental_attachments,
    parts:
      uiMsg.parts
        ?.map(convertUIPart)
        .filter((part): part is NonNullable<typeof part> => part !== null) ??
      [],
    toolInvocations:
      uiMsg.parts
        ?.filter((p) => p.type === "tool-invocation")
        .map((p) => (p as any).toolInvocation) ?? [],
  };
}

export function toMessages(uiMessages: UIMessage[]): Message[] {
  return uiMessages.map(toMessage);
}

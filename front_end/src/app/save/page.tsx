"use client";
import React from "react";
import { PromptListPage } from "@/components/pages/save/prompt-list";
import { PromptPair } from "@/components/pages/save/prompt-list";
import { deleteResponse, getResponses } from "../api/responses/backend-service";
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper";

export default function PromptHistoryPage() {
  const [responses, setResponses] = React.useState<PromptPair[]>([]);
  const [loading, setLoading] = React.useState(false);
  const fetch = async () => {
    setLoading(true);
    const res = await getResponses();
    const data = await res.data;

    setResponses(
      data.map(
        (item) =>
          ({
            id: item.response_id,
            inputPrompt: item.input,
            outputResult: item.output,
            timestamp: item.created_at,
            tags: [],
          } as PromptPair)
      )
    );
    setLoading(false);
  };
  React.useEffect(() => {
    fetch();
  }, []);

  const handleEditPrompt = (index: number) => {
    console.log("Edit prompt at index:", index);
  };

  const handleDeletePrompt = async (index: number) => {
    await deleteResponse(responses[index].id);
    fetch();
  };

  return (
    <SkeletonWrapper loading={loading}>
      <PromptListPage
        promptPairs={responses}
        onEditPrompt={handleEditPrompt}
        onDeletePrompt={handleDeletePrompt}
      />
    </SkeletonWrapper>
  );
}
export const mockPromptPairs: PromptPair[] = [
  {
    id: "1",
    inputPrompt: "What is the capital of France?",
    outputResult:
      "Can you tell me the capital city of France, including any historical significance it might have?",
    timestamp: "2025-05-08T10:00:00.000Z",
    tags: ["geography", "history"],
  },
  {
    id: "2",
    inputPrompt: "Explain photosynthesis",
    outputResult:
      "Please provide a simple explanation of photosynthesis suitable for a middle school student.",
    timestamp: "2025-05-08T10:05:00.000Z",
    tags: ["biology", "education"],
  },
  {
    id: "3",
    inputPrompt: "How does a blockchain work?",
    outputResult:
      "Explain the concept of blockchain as a decentralized ledger system with examples of its real-world applications.",
    timestamp: "2025-05-08T10:10:00.000Z",
    tags: ["technology", "crypto"],
  },
  {
    id: "4",
    inputPrompt: "Summarize World War II",
    outputResult:
      "Provide a brief summary of the causes, major events, and consequences of World War II.",
    timestamp: "2025-05-08T10:15:00.000Z",
    tags: ["history", "summary"],
  },
  {
    id: "5",
    inputPrompt: "What's the difference between HTTP and HTTPS?",
    outputResult:
      "Describe the difference between HTTP and HTTPS, and why HTTPS is more secure.",
    timestamp: "2025-05-08T10:20:00.000Z",
    tags: ["web", "security"],
  },
];

export const types = ["OpenAI", "DeepSeek", "Meta LLaMA", "xAI Grok"] as const;

export type ModelType = (typeof types)[number];

export interface Model<Type = string> {
  id: string;
  name: string;
  description: string;
  strengths?: string;
  type: Type;
}

export const models: Model<ModelType>[] = [
  {
    id: "dfb3c6f4-92e7-4b9f-9c64-df11d7f6e9d2",
    name: "deepseek-coder",
    description:
      "DeepSeek Coder excels at translating complex instructions into optimized code. Strong at long-context reasoning, debugging, and structured output generation.",
    type: "DeepSeek",
    strengths:
      "Code synthesis, long-context reasoning, debugging, data structure transformation",
  },
  {
    id: "f2b1ce90-1111-4d7e-8f20-8f9ddfa6f39c",
    name: "llama-3-70b",
    description:
      "Meta's LLaMA 3, 70B parameter model, excels in open-ended dialogue and instruction following. Strong balance between reasoning and speed.",
    type: "Meta LLaMA",
    strengths: "Chatbots, summarization, instruction following, few-shot tasks",
  },
  {
    id: "d7b58a97-2ea1-4205-9c99-fb2a99dc23b4",
    name: "grok-1",
    description:
      "xAI's Grok model tuned for conversational intelligence and wit. Strong reasoning engine with a personality. Well-integrated with real-time knowledge (X).",
    type: "xAI Grok",
    strengths:
      "Conversational reasoning, pop culture, dynamic knowledge, real-time integration",
  },
  {
    id: "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
    name: "gpt-4.1",
    description:
      "Advanced multimodal model excelling in coding, instruction following, and long-context comprehension. Supports up to 1 million tokens and outperforms GPT-4o in coding tasks.",
    type: "OpenAI",
    strengths:
      "Coding, complex instruction following, long-context tasks, building AI agents",
  },
  {
    id: "b2c3d4e5-f6a7-8901-b2c3-d4e5f6789012",
    name: "gpt-4.1-mini",
    description:
      "Efficient version of GPT-4.1, matching or exceeding GPT-4o performance with lower latency and cost. Ideal for rapid coding and instruction tasks.",
    type: "OpenAI",
    strengths: "Fast coding, instruction following, cost-efficient processing",
  },
  {
    id: "c3d4e5f6-a7b8-9012-c3d4-e5f678901234",
    name: "gpt-4.1-nano",
    description:
      "Fastest and cheapest GPT-4.1 variant, optimized for classification, autocompletion, and lightweight tasks with minimal latency.",
    type: "OpenAI",
    strengths:
      "Classification, autocompletion, lightweight tasks, low-latency applications",
  },
  {
    id: "d4e5f6a7-b8c9-0123-d4e5-f67890123456",
    name: "o3",
    description:
      "Advanced reasoning model designed for complex multistep problems in coding, math, science, and visual tasks. Integrates image analysis and tool usage for agentic workflows.",
    type: "OpenAI",
    strengths:
      "Complex reasoning, coding, visual reasoning, multistep problem-solving",
  },
  {
    id: "f6a7b8c9-d0e1-2345-f6a7-b89012345678",
    name: "llama-3-8b",
    description:
      "Meta's LLaMA 3, 8B parameter model, optimized for lightweight tasks and rapid inference. Ideal for resource-constrained environments and efficient processing.",
    type: "Meta LLaMA",
    strengths:
      "Fast inference, lightweight tasks, text classification, few-shot learning",
  },
];

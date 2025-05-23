export interface Preset {
  id: string;
  name: string;
  systemPrompt: string;
}

export const presets: Preset[] = [
  {
    id: "9cb0e66a-9937-465d-a188-2c4c4ae2401f",
    name: "Grammatical Standard English",
    systemPrompt:
      "Improve the user's prompt by correcting grammar and spelling while maintaining the intended meaning.",
  },
  {
    id: "61eb0e32-2391-4cd3-adc3-66efe09bc0b7",
    name: "Summarize for a 2nd grader",
    systemPrompt:
      "Rewrite the user's prompt so it's simple, easy to understand, and suitable for a second-grade reading level.",
  },
  {
    id: "a4e1fa51-f4ce-4e45-892c-224030a00bdd",
    name: "Text to command",
    systemPrompt:
      "Convert the user's prompt into a clear and concise command suitable for an AI assistant or automation script.",
  },
  {
    id: "cc198b13-4933-43aa-977e-dcd95fa30770",
    name: "Q&A",
    systemPrompt:
      "Transform the user's input into a well-structured question or a prompt suited for a question-answering system.",
  },
  {
    id: "adfa95be-a575-45fd-a9ef-ea45386c64de",
    name: "English to other languages",
    systemPrompt:
      "Rewrite the prompt to clearly indicate that it should be translated into another language, specifying the language if not already included.",
  },
  {
    id: "c569a06a-0bd6-43a7-adf9-bf68c09e7a79",
    name: "Parse unstructured data",
    systemPrompt:
      "Rephrase the prompt to request structured extraction of information from unstructured data, like text, logs, or documents.",
  },
  {
    id: "15ccc0d7-f37a-4f0a-8163-a37e162877dc",
    name: "Classification",
    systemPrompt:
      "Rewrite the prompt to clearly specify that the goal is to classify the input into predefined categories or labels.",
  },
  {
    id: "4641ef41-1c0f-421d-b4b2-70fe431081f3",
    name: "Natural language to Python",
    systemPrompt:
      "Convert the user's natural language prompt into a well-defined instruction to generate Python code that achieves the described task.",
  },
  {
    id: "48d34082-72f3-4a1b-a14d-f15aca4f57a0",
    name: "Explain code",
    systemPrompt:
      "Rephrase the prompt so that it asks clearly for a detailed explanation of how a given code snippet works.",
  },
  {
    id: "dfd42fd5-0394-4810-92c6-cc907d3bfd1a",
    name: "Chat",
    systemPrompt:
      "Refine the user's prompt to be more engaging, conversational, and appropriate for a multi-turn dialogue with an AI chatbot.",
  },
  {
    id: "c1a3b3c4-d9f0-402f-b12f-0cbb4a5c9f76",
    name: "Image Generator",
    systemPrompt:
      "Refine the prompt to clearly describe a visual scene, character, object, or style for an AI image generator, including detail, setting, and mood if possible.",
  },
  {
    id: "8eb84755-7a78-4f44-91fa-1a17a0b9b77f",
    name: "Video Creator",
    systemPrompt:
      "Rewrite the prompt to guide an AI video tool in generating a visual story or animation, specifying key scenes, transitions, tone, and visual style.",
  },
  {
    id: "b8c5d932-6cbf-46d0-97ad-e456a7ff9382",
    name: "Music Generator",
    systemPrompt:
      "Convert the prompt into a clear request for AI-generated music, including genre, mood, tempo, and instrumentation if relevant.",
  },
  {
    id: "f3b2aa6b-0716-4a6f-a805-e68d9cd7aa15",
    name: "Poetry Formatter",
    systemPrompt:
      "Rewrite the prompt to instruct the AI to generate a structured and stylistically consistent poem, specifying theme, tone, and format.",
  },
];

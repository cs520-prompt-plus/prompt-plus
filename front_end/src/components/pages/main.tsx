"use client";
import { Model, models, types } from "@/components/data/models";
import { presets } from "@/components/data/presets";
import { CodeViewer } from "@/components/pages/main/code-viewer";
import { MaxLengthSelector } from "@/components/pages/main/maxlength-selector";
import { ModelSelector } from "@/components/pages/main/model-selector";
import { PresetActions } from "@/components/pages/main/preset-actions";
import { PresetSave } from "@/components/pages/main/preset-save";
import { PresetSelector } from "@/components/pages/main/preset-selector";
import { PresetShare } from "@/components/pages/main/preset-share";
import { TemperatureSelector } from "@/components/pages/main/temperature-selector";
import { TopPSelector } from "@/components/pages/main/top-p-selector";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Edit, RotateCcw } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { Complete } from "../icons/Complete";
import { ChatDemo } from "./main/chatBot";
import { VerticalStepper } from "./main/stepper";
import { Checkbox } from "../ui/checkbox";

export const metadata: Metadata = {
  title: "Playground",
  description: "The OpenAI Playground built using the components.",
};

interface Pattern {
  name: string;
  description: string;
  example: string;
  applied?: boolean;
}

interface Category {
  preview: string;
  patterns: Pattern[];
  category: string;
}

interface Response {
  id: string;
  user_id: string;
  input: string;
  output: string;
  categories: Category[];
}

export default function PlaygroundPage() {
  const [step, setStep] = React.useState(0);
  const [selectedModel, setSelectedModel] = React.useState<Model>(models[0]);
  const [input, setInput] = React.useState("");
  const [tab, setTab] = React.useState("edit");
  const [unlock, setUnlock] = React.useState(false);
  const [data, setData] = React.useState<Response | null>(mockData);
  const fetchData = async () => {
    return mockData;
  };

  React.useEffect(() => {
    if (data) {
      setUnlock(true);
    }
  }, [data]);
  // useEffect(() => {
  //   const fetchDataAsync = async () => {
  //     const response = await fetchData();
  //     setData(response);
  //     setInput(response.input);
  //   };
  //   fetchDataAsync();
  // },[]);

  const handleSubmit = async () => {
    try {
      // const payload = {
      //   user_id: "3a99b221-3570-40bc-9b1a-0633e7c8c676", // dummy user;
      //   input: input,
      // };
      console.log("Input submitted:", input);

      // const res = await createResponse(payload);
      toast.success("Response created successfully!");
      const newData = await fetchData();
      setData(newData);
      setInput(newData.input);
      // const response = res.data;
      // console.log(response);
    } catch (error) {
      toast.error("Error creating response. Please try again.");
      console.error("Submission failed", error);
    }
  };

  return (
    <div className="p-10 h-full w-full ">
      <div className="md:hidden">
        <Image
          src="/examples/playground-light.png"
          width={1280}
          height={916}
          alt="Playground"
          className="block dark:hidden"
        />
        <Image
          src="/examples/playground-dark.png"
          width={1280}
          height={916}
          alt="Playground"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full w-full flex-col md:flex justify-center items-center">
        <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
          <h2 className="text-lg font-semibold">Playground</h2>
          <div className="ml-auto flex w-full space-x-2 sm:justify-end">
            <PresetSelector presets={presets} />
            <PresetSave />
            <div className="hidden space-x-2 md:flex">
              <CodeViewer />
              <PresetShare />
            </div>
            <PresetActions />
          </div>
        </div>
        <Separator />
        <div className="container flex w-full items-center justify-between space-x-2 h-full py-4">
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex-1 h-full w-full justify-center items-center"
          >
            <div className="container h-full w-full py-6">
              <div className="grid h-full w-full items-stretch gap-6 md:grid-cols-[1fr_200px]">
                <div className="hidden flex-col space-y-4 sm:flex md:order-2">
                  <div className="grid gap-2">
                    <HoverCard openDelay={200}>
                      <HoverCardTrigger asChild>
                        <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Mode
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="w-[320px] text-sm"
                        side="left"
                      >
                        Choose the mode that best suits your task. You can
                        provide: a simple prompt to complete, starting and
                        ending text to insert a completion within, or some text
                        with instructions to edit it through our multistep
                        process.
                      </HoverCardContent>
                    </HoverCard>
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="complete">
                        <span className="sr-only">Complete</span>
                        <Complete />
                      </TabsTrigger>

                      <TabsTrigger
                        value="edit"
                        className={cn(!unlock ? "bg-muted" : "bg-transparent")}
                        disabled={!unlock}
                      >
                        <span className="sr-only">Edit</span>
                        <Edit />
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <ModelSelector
                    types={types}
                    models={models}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                  />
                  <TemperatureSelector defaultValue={[0.56]} />
                  <MaxLengthSelector defaultValue={[256]} />
                  <TopPSelector defaultValue={[0.9]} />
                </div>
                <div className="md:order-1 h-full w-full flex flex-col gap-2 ">
                  <TabsContent
                    value="complete"
                    className="mt-0 border-0 p-0 flex gap-2"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="grid h-full gap-6 ">
                        <div className="flex flex-col space-y-4">
                          <div className="flex flex-1 flex-col space-y-2">
                            <Label htmlFor="input">Input</Label>
                            <Textarea
                              id="input"
                              placeholder="Here is my prompt: I want to build a web application that allows users to create and share their own recipes."
                              className="flex-1 min-h-[40vh] w-[30vw]"
                              onChange={(e) => setInput(e.target.value)}
                              value={input}
                            />
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Label htmlFor="instructions">System Prompt</Label>
                            <Textarea
                              id="instructions"
                              placeholder="Fix the grammar."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button onClick={handleSubmit}>Submit</Button>{" "}
                        <Button variant="secondary">
                          <span className="sr-only">Show history</span>
                          <RotateCcw />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col space-y-2">
                      <Label htmlFor="input">Output</Label>
                      <ChatDemo model={selectedModel.name} />
                    </div>
                  </TabsContent>
                  <TabsContent
                    value="edit"
                    className="mt-0 border-0 p-0 flex gap-10 flex-col"
                  >
                    <VerticalStepper step={step} handleStep={setStep} />
                    <div className="flex w-full space-x-9 h-full">
                      <div className="flex h-full w-full flex-col space-y-4 justify-between">
                        <Accordion type="single" collapsible className="w-full">
                          {data &&
                            data.categories[step].patterns.map(
                              (pattern, index) => {
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-center gap-2 w-full"
                                  >
                                    <Checkbox
                                      checked={pattern.applied}
                                      onCheckedChange={(checked) => {
                                        if (checked) return;
                                        setData((prevData) => {
                                          if (!prevData) return prevData;
                                          prevData.categories[step].patterns[
                                            index
                                          ].applied = checked;
                                          return {
                                            ...prevData,
                                            categories: prevData.categories.map(
                                              (cat, catIndex) =>
                                                catIndex === step
                                                  ? {
                                                      ...cat,
                                                      patterns:
                                                        cat.patterns.map(
                                                          (pat, patIndex) =>
                                                            patIndex === index
                                                              ? {
                                                                  ...pat,
                                                                  applied:
                                                                    checked,
                                                                }
                                                              : pat
                                                        ),
                                                    }
                                                  : cat
                                            ),
                                          };
                                        });
                                      }}
                                      // onCheckedChange={(checked) =>
                                      //   handleCheckboxChange(index, checked)
                                      // }
                                      className="h-4 w-4 border-black dark:border-white"
                                    />
                                    <AccordionItem
                                      value={`item-${index}`}
                                      className="w-full"
                                    >
                                      <AccordionTrigger>
                                        <div className="flex items-center space-x-2">
                                          <span>{pattern.name}</span>
                                        </div>
                                      </AccordionTrigger>

                                      <AccordionContent>
                                        <div className="space-y-2">
                                          <Card className="py-0 gap-1">
                                            <CardHeader className="">
                                              <CardTitle className="text-sm font-semibold">
                                                Description
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <pre className="whitespace-pre-wrap break-words rounded-md bg-background text-sm">
                                                {pattern.description}
                                              </pre>
                                            </CardContent>
                                          </Card>

                                          <Card className="py-0 gap-1">
                                            <CardHeader>
                                              <CardTitle className="text-sm font-semibold">
                                                Example
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <pre className="whitespace-pre-wrap break-words rounded-md bg-background text-sm">
                                                {pattern.example}
                                              </pre>
                                            </CardContent>
                                          </Card>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </div>
                                );
                              }
                            )}
                        </Accordion>

                        <div className="flex items-center space-x-2">
                          <Button>Apply</Button>
                          <Button variant="secondary">
                            <span className="sr-only">Show history</span>
                            <RotateCcw />
                          </Button>
                        </div>
                      </div>
                      <div className="flex w-full h-full flex-col space-y-2">
                        <Label htmlFor="input">Preview</Label>
                        <Textarea
                          id="preview"
                          placeholder="Here is the preview of the output for this step."
                          className="flex-1 min-h-[40vh] w-full"
                          value={data?.categories[step].preview}
                          readOnly
                        />
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
const mockData = {
  id: "1",
  user_id: "3a99b221-3570-40bc-9b1a-0633e7c8c676",
  input: "Here is the input from backend",
  output: "Here is the output from backend",
  categories: [
    {
      preview: "Here is the preview from backend for Category 1",
      patterns: [
        {
          name: "Meta Language Creation",
          description: "Description of pattern 1",
          example: "Example of pattern 1",
          applied: true,
        },
      ],
      category: "Category 1",
    },
    {
      preview: "Backend preview for Category 2",
      patterns: [
        {
          name: "Output Automater",
          description: "This is the description for pattern A",
          example: "Example usage of pattern A",
          applied: false,
        },
        {
          name: "Persona",
          description: "Detailed description of pattern B",
          example: "Example for pattern B here",
          applied: true,
        },
        {
          name: "Visualization Generator",
          description: "Detailed description of pattern B",
          example: "Example for pattern B here",
          applied: true,
        },
        {
          name: "Recipe",
          description: "Detailed description of pattern B",
          example: "Example for pattern B here",
          applied: false,
        },
        {
          name: "Template",
          description: "Detailed description of pattern B",
          example: "Example for pattern B here",
          applied: true,
        },
      ],
      category: "Category 2",
    },
    {
      preview: "Preview from backend for Category 3",
      patterns: [
        {
          name: "Fact Check List",
          description: "Matches any digits in a string",
          example: "Input: 'abc123' → Output: '123'",
          applied: false,
        },
        {
          name: "Reflection",
          description: "Extracts dates from sentences",
          example: "Input: 'Today is 2025-04-25' → Output: '2025-04-25'",
          applied: true,
        },
      ],
      category: "Category 3",
    },
    {
      preview: "Preview data for Category 4 from backend",
      patterns: [
        {
          name: "Question Refinement",
          description: "Converts text to lowercase",
          example: "Input: 'HELLO' → Output: 'hello'",
          applied: false,
        },
        {
          name: "Alternative Approaches",
          description: "Converts text to uppercase",
          example: "Input: 'hello' → Output: 'HELLO'",
          applied: true,
        },
        {
          name: "Cognitive Verifier",
          description: "Converts text to uppercase",
          example: "Input: 'hello' → Output: 'HELLO'",
          applied: false,
        },
        {
          name: "Refusal Breaker",
          description: "Converts text to uppercase",
          example: "Input: 'hello' → Output: 'HELLO'",
          applied: true,
        },
      ],
      category: "Category 4",
    },
    {
      preview: "Latest preview from backend for Category 5",
      patterns: [
        {
          name: "Flipped Interaction",
          description: "Removes leading and trailing spaces",
          example: "Input: '  hello  ' → Output: 'hello'",
          applied: false,
        },
        {
          name: "Game Play",
          description: "Replaces tab characters with spaces",
          example: "Input: 'a\\tb' → Output: 'a  b'",
          applied: true,
        },
        {
          name: "Infinite Generation",
          description: "Replaces tab characters with spaces",
          example: "Input: 'a\\tb' → Output: 'a  b'",
          applied: true,
        },
      ],
      category: "Category 5",
    },
    {
      preview: "Additional preview from backend for Category 6",
      patterns: [
        {
          name: "Context Manager",
          description: "Reverses the input string",
          example: "Input: 'hello' → Output: 'olleh'",
          applied: false,
        },
      ],
      category: "Category 6",
    },
  ],
};

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import {
  getResponseById,
  mergePreviews,
  updateCategoryPatterns,
  updateResponse,
  createResponse,
  getResponses,
} from "@/app/api/responses/backend-service";
import { patternDescriptions } from "@/app/constants/enum";
import { Model, models, types } from "@/components/data/models";
import { Preset, presets } from "@/components/data/presets";
import { ChatDemo } from "@/components/pages/main/chatBot";
import { BeforeAfterPage } from "@/components/pages/main/comparison";
import { MaxLengthSelector } from "@/components/pages/main/maxlength-selector";
import { ModelSelector } from "@/components/pages/main/model-selector";
import { PresetActions } from "@/components/pages/main/preset-actions";
import { PresetSelector } from "@/components/pages/main/preset-selector";
import { PresetShare } from "@/components/pages/main/preset-share";
import { PromptInput } from "@/components/pages/main/prompt-input";
import { VerticalStepper } from "@/components/pages/main/stepper";
import { TemperatureSelector } from "@/components/pages/main/temperature-selector";
import { TopPSelector } from "@/components/pages/main/top-p-selector";
import { useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ResponseCreateResponse } from "@/types/response";
import type { Message as UIMessage } from "@ai-sdk/react";
import { produce } from "immer";
import {
  BotMessageSquare,
  ChevronsLeftRightEllipsisIcon,
  Edit,
  RotateCcw,
  Settings,
  TextCursorInput,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";

export default function PlaygroundPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [step, setStep] = React.useState(0);
  const [selectedModel, setSelectedModel] = React.useState<Model>(models[0]);
  const [input, setInput] = React.useState("");
  const [tab, setTab] = React.useState("input");
  const [editUnlock, setEditUnLock] = React.useState(false);
  const [outputUnlock, setOutputUnlock] = React.useState(false);
  const [comparisonUnlock, setComparisonUnlock] = React.useState(false);
  const [data, setData] = React.useState<ResponseCreateResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [style, setStyle] = React.useState("improve");
  const [selectedPreset, setSelectedPreset] = React.useState<Preset>();
  const [lastAIMessage, setLastAIMessage] = React.useState<UIMessage | null>(
    null
  );
  const [valid, setValid] = React.useState(false);
  const [previewUpdated, setPreviewUpdated] = React.useState(false);
  const [refinePrompt, setRefinePrompt] = React.useState("");
  const [currentReponseId, setCurrentResponseId] = React.useState<
    string | undefined
  >(id ?? undefined);
  const [pastResponse, setPastResponse] = React.useState<
    ResponseCreateResponse[]
  >([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getResponses();
        const response = res.data;
        const enhancedResponses: ResponseCreateResponse[] = response.map(
          (res) => ({
            ...res,
            categories: (res.categories ?? []).map((category) => ({
              ...category,
              patterns: category.patterns.map((pattern) => ({
                ...pattern,
                description:
                  patternDescriptions[
                    pattern.pattern as keyof typeof patternDescriptions
                  ] || "",
              })),
            })),
          })
        );
        setPastResponse(enhancedResponses);
      } catch (error) {
        console.error("Error fetching past response:", error);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    if (currentReponseId === "create-new-response") {
      clearPreset();
      return;
    }
    const selectedResponse = pastResponse.find(
      (res) => res.response_id === currentReponseId
    );
    if (selectedResponse) {
      setData(selectedResponse);
      setInput(selectedResponse.input);
      setRefinePrompt(selectedResponse.output);
      setEditUnLock(true);
      setOutputUnlock(true);
      setComparisonUnlock(true);
    }
  }, [currentReponseId, pastResponse]);

  const setDataImmer = (updater: (draft: ResponseCreateResponse) => void) => {
    setData((prev) => produce(prev, updater));
  };

  const handleApplyCategory = async (categoryIndex: number) => {
    setLoading(true);
    try {
      if (!data?.categories || !data.categories[categoryIndex]) {
        toast.error("Category data missing.");
        return;
      }

      const category = data.categories[categoryIndex];
      const payload = {
        patterns: category.patterns.map((p) => ({
          pattern_id: p.pattern_id,
          applied: p.applied,
        })),
      };

      console.log("Updating category with ID:", category.category_id);

      const res = await updateCategoryPatterns(category.category_id, payload);
      const updatedCategory = res.data;

      console.log("API response:", updatedCategory);
      const enrichedPatterns = updatedCategory.patterns.map((pattern) => ({
        ...pattern,
        description:
          patternDescriptions[
            pattern.pattern as keyof typeof patternDescriptions
          ] || "",
      }));
      updatedCategory["patterns"] = enrichedPatterns;
      console.log(updatedCategory);

      setDataImmer((draft) => {
        if (!draft.categories) return;
        draft.categories[categoryIndex] = updatedCategory;
      });
      setPreviewUpdated(true);
      setOutputUnlock(false);

      toast.success(
        "Category applied successfully! New Preview is ready. To view final Prompt, please merge Previews."
      );
    } catch (error) {
      toast.error("Failed to apply category. Try again.");
      console.error("Error updating category patterns:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearPreset = () => {
    setStep(0);
    setSelectedModel(models[0]);
    setInput("");
    setTab("input");
    setEditUnLock(false);
    setOutputUnlock(false);
    setComparisonUnlock(false);
    setData(null);
    setLoading(false);
    setStyle("improve");
    setSelectedPreset(undefined);
    setLastAIMessage(null);
    setValid(false);
    setPreviewUpdated(false);
    setRefinePrompt("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (style == "generate") {
        setInput(
          "Generate an AI prompt with the following specifications: " + input
        );
      }
      console.log("Input submitted:", input);
      let userInput = input;
      if (style == "generate") {
        userInput = await fetch("/api/gen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userInput }),
        })
          .then((res) => res.json())
          .then((data) => data);
      }
      const payload = {
        input: userInput,
      };
      const res = await createResponse(payload);
      console.log("Response received:", res);

      const response = res.data;
      const enhancedResponse: ResponseCreateResponse = {
        ...response,
        categories: (response.categories ?? []).map((category) => ({
          ...category,
          patterns: category.patterns.map((pattern) => ({
            ...pattern,
            description:
              patternDescriptions[
                pattern.pattern as keyof typeof patternDescriptions
              ] || "",
          })),
        })),
      };

      setData(enhancedResponse);
      setInput(enhancedResponse.input);
      setEditUnLock(true);
      setOutputUnlock(true);
      setEditUnLock(true);
      setOutputUnlock(true);
      setRefinePrompt(enhancedResponse.output);
      toast.success("Response created successfully!");
    } catch (error) {
      toast.error("Error creating response. Please try again.");
      console.error("Submission failed", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (lastAIMessage && data) {
        const final_output = lastAIMessage.content;
        const response_id = data.response_id;

        await updateResponse(response_id, { output: final_output });
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
        toast.success("Final Prompt successfully saved.");
        setLastAIMessage(null);
      }
    } catch (error) {
      toast.error("Error updating response. Please try again.");
      console.error("Updating failed", error);
    }
    setLoading(false);
  };

  const handleMerge = async () => {
    setLoading(true);
    try {
      if (data && data.categories) {
        const previews = data.categories.map((category) => category.preview);
        const response_id = data.response_id;
        const res = await mergePreviews(response_id, {
          previews: previews,
        });
        const response = res.data;
        const enhancedResponse: ResponseCreateResponse = {
          ...response,
          categories: (response.categories ?? []).map((category) => ({
            ...category,
            patterns: category.patterns.map((pattern) => ({
              ...pattern,
              description:
                patternDescriptions[
                  pattern.pattern as keyof typeof patternDescriptions
                ] || "",
            })),
          })),
        };

        setData(enhancedResponse);
        setInput(enhancedResponse.input);
        setRefinePrompt(enhancedResponse.output);
        toast.success("Successfully Merge Previews.");
        setPreviewUpdated(false);
        setOutputUnlock(true);
      }
    } catch (error) {
      toast.error("Error merging previews. Please try again.");
      console.error("Merging failed", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-10 h-full w-full bg-white dark:bg-black">
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
            <Select
              value={currentReponseId}
              onValueChange={setCurrentResponseId}
            >
              <SelectTrigger className="w-[20vw]">
                <SelectValue
                  placeholder="Select the past response or create a new one"
                  defaultValue={"improve"}
                />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Choose your past response</SelectLabel>
                  {pastResponse.map((response) => (
                    <SelectItem
                      key={response.response_id}
                      value={response.response_id}
                    >
                      {response.input.slice(0, 50) + "..."}
                    </SelectItem>
                  ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Or</SelectLabel>
                  <SelectItem
                    key={"create-new-response"}
                    value={"create-new-response"}
                  >
                    Create a new response
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="hidden space-x-2 md:flex">
              <PresetShare />
            </div>
            <PresetActions clearPreset={clearPreset} />
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
                        provide: a simple prompt to input, starting and ending
                        text to insert a completion within, or some text with
                        instructions to edit it through our multistep process.
                      </HoverCardContent>
                    </HoverCard>
                    <TabsList className="grid grid-cols-4">
                      <TabsTrigger value="input">
                        <span className="sr-only">Input</span>
                        <TextCursorInput />
                      </TabsTrigger>

                      <TabsTrigger
                        value="edit"
                        className={cn(
                          !editUnlock ? "bg-muted" : "bg-transparent"
                        )}
                        disabled={!editUnlock}
                      >
                        <span className="sr-only">Edit</span>
                        <Edit />
                      </TabsTrigger>
                      <TabsTrigger
                        value="output"
                        className={cn(
                          !outputUnlock ? "bg-muted" : "bg-transparent"
                        )}
                        disabled={!outputUnlock}
                      >
                        <span className="sr-only">Output</span>
                        <BotMessageSquare />
                      </TabsTrigger>
                      <TabsTrigger
                        value="compare"
                        className={cn(
                          !comparisonUnlock ? "bg-muted" : "bg-transparent"
                        )}
                        disabled={!comparisonUnlock}
                      >
                        <span className="sr-only">Comparison</span>
                        <ChevronsLeftRightEllipsisIcon />
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <DropdownMenu>
                    <HoverCard openDelay={200}>
                      <HoverCardTrigger asChild>
                        <Label htmlFor="model">Model</Label>
                      </HoverCardTrigger>
                      <HoverCardContent
                        align="start"
                        className="w-[260px] text-sm"
                        side="left"
                      >
                        The model which will generate the completion. Some
                        models are suitable for natural language tasks, others
                        specialize in code. Learn more.
                      </HoverCardContent>
                    </HoverCard>
                    <div className="flex items-center space-x-2">
                      <ModelSelector
                        types={types}
                        models={models}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                      />
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Settings />
                        </Button>
                      </DropdownMenuTrigger>
                    </div>

                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Model Setting</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <TemperatureSelector defaultValue={[0.56]} />
                        <TopPSelector defaultValue={[0.9]} />
                        <MaxLengthSelector defaultValue={[256]} />
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="md:order-1 h-full w-full flex flex-col gap-2 ">
                  <TabsContent
                    value="input"
                    className="mt-0 border-0 p-0 flex gap-2"
                  >
                    <div className="flex flex-col w-full h-full space-y-4">
                      <SkeletonWrapper
                        loading={loading}
                        className="h-full min-h-[50vh] w-full"
                      >
                        <div className="flex flex-1 flex-col space-y-2">
                          <div className="flex items-center space-x-2 justify-between">
                            <Label htmlFor="input">Input</Label>{" "}
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="style">
                                How we can help you?
                              </Label>
                              <Select value={style} onValueChange={setStyle}>
                                <SelectTrigger className="w-[20vw]">
                                  <SelectValue
                                    placeholder="Select the style"
                                    defaultValue={"improve"}
                                  />
                                </SelectTrigger>

                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Choose your style</SelectLabel>
                                    <SelectItem value="improve">
                                      Improve my current prompt
                                    </SelectItem>
                                    <SelectItem value="generate">
                                      Generate a new prompt
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <PromptInput
                            onValidated={(valid, feedback) => {
                              setValid(valid);
                            }}
                            input={input}
                            setInput={setInput}
                          />
                          <div className="flex items-center space-x-2 justify-between">
                            <Label htmlFor="instructions">System Prompt</Label>{" "}
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="style">Want a Quick Setup?</Label>
                              <PresetSelector
                                presets={presets}
                                selectedPreset={selectedPreset}
                                setSelectedPreset={setSelectedPreset}
                              />
                            </div>
                          </div>

                          <Textarea
                            id="instructions"
                            className="flex-1 min-h-[10vh] w-full"
                            placeholder="Fix the grammar."
                            value={selectedPreset?.systemPrompt}
                          />
                        </div>
                      </SkeletonWrapper>
                      <div className="w-full flex h-full items-center justify-between">
                        <div className="flex items-center h-full space-x-2 ">
                          <Button
                            onClick={handleSubmit}
                            disabled={loading || !valid}
                          >
                            {loading ? <Spinner /> : "Submit"}
                          </Button>
                        </div>
                        <div className="flex items-center h-full space-x-2 ">
                          <Button
                            onClick={() => {
                              setTab("edit");
                            }}
                            disabled={!editUnlock}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => {
                              setTab("output");
                            }}
                            disabled={!outputUnlock}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent
                    value="edit"
                    className=" mt-0 border-0 p-0 flex gap-10 flex-col justify-start"
                  >
                    <VerticalStepper step={step} handleStep={setStep} />
                    <div className="flex w-full space-x-9 h-full">
                      <div className="flex h-full w-full flex-col space-y-4 justify-between">
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full max-h-[55vh] overflow-auto"
                        >
                          {data &&
                            data?.categories?.[step]?.patterns?.map(
                              (pattern, index) => {
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-center gap-2 w-full"
                                  >
                                    <Checkbox
                                      checked={pattern.applied}
                                      onCheckedChange={(checked) => {
                                        if (checked === "indeterminate") return;
                                        setDataImmer((prevData) => {
                                          if (!prevData) return prevData;
                                          prevData.categories![step].patterns[
                                            index
                                          ].applied = checked;
                                        });
                                      }}
                                      className="h-4 w-4 border-black dark:border-white"
                                    />
                                    <AccordionItem
                                      value={`item-${index}`}
                                      className="w-full"
                                    >
                                      <AccordionTrigger>
                                        <div className="flex items-center space-x-2">
                                          <span>{pattern.pattern}</span>
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
                                                Feedback
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <pre className="whitespace-pre-wrap break-words rounded-md bg-background text-sm">
                                                {pattern.feedback}
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
                          <Button onClick={() => handleApplyCategory(step)}>
                            Apply <RotateCcw />
                          </Button>
                        </div>
                      </div>

                      <SkeletonWrapper
                        loading={loading}
                        outerClassName="h-[50vh]"
                      >
                        <div className="flex w-full h-[50vh] flex-col gap-4">
                          <Label htmlFor="input">Preview</Label>
                          <Textarea
                            id="preview"
                            placeholder="Here is the preview of the output for this step."
                            className="flex-1 h-full w-full"
                            value={data?.categories![step].preview}
                            readOnly
                          />
                        </div>
                      </SkeletonWrapper>
                    </div>
                    {step == 5 && (
                      <Button
                        onClick={() => handleMerge()}
                        disabled={!previewUpdated}
                      >
                        Merge Previews
                      </Button>
                    )}
                  </TabsContent>
                  <TabsContent
                    value="output"
                    forceMount
                    className=" data-[state=inactive]:hidden h-full w-full mt-0 border-0 p-0 flex gap-4 flex-col"
                  >
                    <div className="flex flex-1 flex-col space-y-2 max-h-[70vh] p-10">
                      <div className="flex items-center justify-between h-full flex-1 w-full">
                        <HoverCard>
                          <HoverCardTrigger>
                            <Label htmlFor="input"> Refining your output</Label>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            click save to take the latest one to be your final
                            response
                          </HoverCardContent>
                        </HoverCard>
                        <Button
                          onClick={() => {
                            setComparisonUnlock(true);
                            setTab("compare");
                          }}
                          disabled={loading}
                        >
                          {loading ? (
                            <Spinner />
                          ) : (
                            <HoverCard>
                              <HoverCardTrigger>
                                <Label htmlFor="input">View Comparison</Label>
                              </HoverCardTrigger>
                              <HoverCardContent>
                                Happy with the output? Click to view the final
                                output
                              </HoverCardContent>
                            </HoverCard>
                          )}
                        </Button>
                      </div>

                      <ChatDemo
                        model={selectedModel.name}
                        initialMessages={[
                          {
                            id: input + "id",
                            role: "assistant",
                            content: data?.output ?? "",
                            parts: [{ type: "text", text: refinePrompt ?? "" }],
                          },
                        ]}
                        onAssistantMessage={(msg) => setLastAIMessage(msg)}
                      />
                    </div>

                    <Button
                      onClick={() => {
                        if (lastAIMessage?.role == "user") {
                          toast.error(
                            "Please customize your output before choosing."
                          );
                        }
                        setDataImmer((draft) => {
                          draft.output = lastAIMessage?.content ?? "";
                          draft.input = input;
                        });
                        toast.success("Final output set successfully!");
                      }}
                      disabled={loading || lastAIMessage == null}
                    >
                      {loading ? (
                        <Spinner />
                      ) : (
                        "Replace Final Output as Latest Prompt"
                      )}
                    </Button>
                  </TabsContent>
                  <TabsContent value="compare">
                    <BeforeAfterPage
                      inputPrompt={data?.input ?? ""}
                      outputResult={data?.output ?? ""}
                      onCopyOutput={() => {
                        navigator.clipboard.writeText(data?.output ?? "");
                        toast.success("Output copied to clipboard!");
                      }}
                    />
                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? <Spinner /> : "Save Final Output"}
                    </Button>
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

const mockData: ResponseCreateResponse = {
  response_id: "1",
  user_id: "3a99b221-3570-40bc-9b1a-0633e7c8c676",
  input: "Here is the input from backend",
  output:
    "Here is the output from backend: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciuntLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciuntLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciuntLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  created_at: new Date().toISOString(),
  categories: [
    {
      category_id: "cat-1",
      category: "Category 1",
      input: "Here is the input from backend",
      preview: "Here is the preview from backend for Category 1",
      patterns: [
        {
          pattern_id: "pat-1-1",
          pattern: "Meta Language Creation",
          description: "Description of pattern 1",
          feedback: "",
          applied: true,
        },
      ],
    },
    {
      category_id: "cat-2",
      category: "Category 2",
      input: "Here is the input from backend",
      preview: "Backend preview for Category 2",
      patterns: [
        {
          pattern_id: "pat-2-1",
          pattern: "Output Automater",
          description: "This is the description for pattern A",
          feedback: "",
          applied: false,
        },
        {
          pattern_id: "pat-2-2",
          pattern: "Persona",
          description: "Detailed description of pattern B",
          feedback: "",
          applied: true,
        },
        {
          pattern_id: "pat-2-3",
          pattern: "Visualization Generator",
          description: "Detailed description of pattern B",
          feedback: "",
          applied: true,
        },
        {
          pattern_id: "pat-2-4",
          pattern: "Recipe",
          description: "Detailed description of pattern B",
          feedback: "",
          applied: false,
        },
        {
          pattern_id: "pat-2-5",
          pattern: "Template",
          description: "Detailed description of pattern B",
          feedback: "",
          applied: true,
        },
      ],
    },
    {
      category_id: "cat-3",
      category: "Category 3",
      input: "Here is the input from backend",
      preview: "Preview from backend for Category 3",
      patterns: [
        {
          pattern_id: "pat-3-1",
          pattern: "Fact Check List",
          description: "Matches any digits in a string",
          feedback: "",
          applied: false,
        },
        {
          pattern_id: "pat-3-2",
          pattern: "Reflection",
          description: "Extracts dates from sentences",
          feedback: "",
          applied: true,
        },
      ],
    },
    {
      category_id: "cat-4",
      category: "Category 4",
      input: "Here is the input from backend",
      preview: "Preview data for Category 4 from backend",
      patterns: [
        {
          pattern_id: "pat-4-1",
          pattern: "Question Refinement",
          description: "Converts text to lowercase",
          feedback: "",
          applied: false,
        },
        {
          pattern_id: "pat-4-2",
          pattern: "Alternative Approaches",
          description: "Converts text to uppercase",
          feedback: "",
          applied: true,
        },
        {
          pattern_id: "pat-4-3",
          pattern: "Cognitive Verifier",
          description: "Converts text to uppercase",
          feedback: "",
          applied: false,
        },
        {
          pattern_id: "pat-4-4",
          pattern: "Refusal Breaker",
          description: "Converts text to uppercase",
          feedback: "",
          applied: true,
        },
      ],
    },
    {
      category_id: "cat-5",
      category: "Category 5",
      input: "Here is the input from backend",
      preview: "Latest preview from backend for Category 5",
      patterns: [
        {
          pattern_id: "pat-5-1",
          pattern: "Flipped Interaction",
          description: "Removes leading and trailing spaces",
          feedback: "",
          applied: false,
        },
        {
          pattern_id: "pat-5-2",
          pattern: "Game Play",
          description: "Replaces tab characters with spaces",
          feedback: "",
          applied: true,
        },
        {
          pattern_id: "pat-5-3",
          pattern: "Infinite Generation",
          description: "Replaces tab characters with spaces",
          feedback: "",
          applied: true,
        },
      ],
    },
    {
      category_id: "cat-6",
      category: "Category 6",
      input: "Here is the input from backend",
      preview: "Additional preview from backend for Category 6",
      patterns: [
        {
          pattern_id: "pat-6-1",
          pattern: "Context Manager",
          description: "Reverses the input string",
          feedback: "",
          applied: false,
        },
      ],
    },
  ],
};

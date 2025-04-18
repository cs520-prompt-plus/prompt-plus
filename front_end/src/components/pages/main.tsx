"use client";
import { Edit, RotateCcw } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";

import { models, types, Model } from "@/components/data/models";
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
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { Complete } from "../icons/Complete";
import { ChatDemo } from "./main/chatBot";
import { VerticalStepper } from "./main/stepper";

export const metadata: Metadata = {
  title: "Playground",
  description: "The OpenAI Playground built using the components.",
};

export default function PlaygroundPage() {
  const [step, setStep] = React.useState(0);
  const [selectedModel, setSelectedModel] = React.useState<Model>(models[0]);
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
            defaultValue="complete"
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
                        Choose the interface that best suits your task. You can
                        provide: a simple prompt to complete, starting and
                        ending text to insert a completion within, or some text
                        with instructions to edit it.
                      </HoverCardContent>
                    </HoverCard>
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="complete">
                        <span className="sr-only">Complete</span>
                        <Complete />
                      </TabsTrigger>
                      <TabsTrigger value="edit">
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
                  <VerticalStepper step={step} handleStep={setStep} />

                  <TabsContent value="complete" className="mt-0 border-0 p-0">
                    <div className="flex h-full flex-col space-y-4">
                      <Textarea
                        placeholder="Enhance my prompt for building a web application: 
                      I want to build a web application that allows users to create and share their own recipes."
                        className="p-4 flex-1"
                      />
                      <div className="flex items-center space-x-2">
                        <Button>Submit</Button>
                        <Button variant="secondary">
                          <span className="sr-only">Show history</span>
                          <RotateCcw />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent
                    value="edit"
                    className="mt-0 border-0 p-0 flex gap-2"
                  >
                    <div className="flex flex-col space-y-4">
                      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                        System Prompt
                      </h2>
                      <div className="grid h-full gap-6 ">
                        <div className="flex flex-col space-y-4">
                          <div className="flex flex-1 flex-col space-y-2">
                            <Label htmlFor="input">Input</Label>
                            <Textarea
                              id="input"
                              placeholder="Here is my prompt: I want to build a web application that allows users to create and share their own recipes."
                              className="flex-1 h-[40vh]"
                            />
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Label htmlFor="instructions">Instructions</Label>
                            <Textarea
                              id="instructions"
                              placeholder="Fix the grammar."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button>Submit</Button>
                        <Button variant="secondary">
                          <span className="sr-only">Show history</span>
                          <RotateCcw />
                        </Button>
                      </div>
                    </div>
                    <ChatDemo model={selectedModel.name} />
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

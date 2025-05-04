"use client";

import { PopoverProps } from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Model, ModelType } from "@/components/data/models";
import { Button } from "@/components/ui/button"; // Adjust the import path as necessary
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMutationObserver } from "@/hooks/use-mutation-observer";
import { cn } from "@/lib/utils";

interface ModelSelectorProps extends PopoverProps {
  types: readonly ModelType[];
  models: Model[];
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
}

export function ModelSelector({
  models,
  types,
  selectedModel,
  setSelectedModel,
  ...props
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [peekedModel, setPeekedModel] = React.useState<Model>(models[0]);

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen} {...props}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a model"
            className="w-full justify-between"
          >
            {selectedModel ? selectedModel.name : "Select a model..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[250px] p-0">
          <HoverCard>
            <HoverCardContent
              side="left"
              align="start"
              forceMount
              className="min-h-[280px]"
            >
              <div className="grid gap-2">
                <h4 className="font-medium leading-none">{peekedModel.name}</h4>
                <div className="text-sm text-muted-foreground">
                  {peekedModel.description}
                </div>
                {peekedModel.strengths ? (
                  <div className="mt-4 grid gap-2">
                    <h5 className="text-sm font-medium leading-none">
                      Strengths
                    </h5>
                    <ul className="text-sm text-muted-foreground">
                      {peekedModel.strengths}
                    </ul>
                  </div>
                ) : null}
              </div>
            </HoverCardContent>
            <Command loop>
              <CommandList className="h-[var(--cmdk-list-height)] max-h-[400px]">
                <CommandInput placeholder="Search Models..." />
                <CommandEmpty>No Models found.</CommandEmpty>
                <HoverCardTrigger asChild>
                  <div>
                    {types.map((type) => (
                      <CommandGroup key={type} heading={type}>
                        {models
                          .filter((model) => model.type === type)
                          .map((model) => (
                            <ModelItem
                              key={model.id}
                              model={model}
                              isSelected={selectedModel?.id === model.id}
                              onPeek={(model) => setPeekedModel(model)}
                              onSelect={() => {
                                setSelectedModel(model);
                                setOpen(false);
                              }}
                            />
                          ))}
                      </CommandGroup>
                    ))}
                  </div>
                </HoverCardTrigger>
              </CommandList>
            </Command>
          </HoverCard>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface ModelItemProps {
  model: Model;
  isSelected: boolean;
  onSelect: () => void;
  onPeek: (model: Model) => void;
}

function ModelItem({ model, isSelected, onSelect, onPeek }: ModelItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  useMutationObserver(ref, (mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "aria-selected" &&
        ref.current?.getAttribute("aria-selected") === "true"
      ) {
        onPeek(model);
      }
    });
  });

  return (
    <CommandItem
      key={model.id}
      onSelect={onSelect}
      ref={ref}
      className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
    >
      {model.name}
      <Check
        className={cn("ml-auto", isSelected ? "opacity-100" : "opacity-0")}
      />
    </CommandItem>
  );
}

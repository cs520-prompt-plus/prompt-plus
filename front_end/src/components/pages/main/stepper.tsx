"use client";
import * as React from "react";
import { Stepper, StepperChangeEvent } from "@progress/kendo-react-layout";
import {
  documentManagerIcon,
  dataIcon,
  eyeIcon,
  gearIcon,
  inheritedIcon,
  sparklesIcon,
} from "@progress/kendo-svg-icons";

const items = [
  { label: "", svgIcon: documentManagerIcon },
  { label: "", svgIcon: sparklesIcon },
  { label: "", svgIcon: dataIcon },
  { label: "", svgIcon: eyeIcon },
  { label: "", svgIcon: inheritedIcon },
  { label: "", svgIcon: gearIcon },
];
const labels = [
  "Input Semantics",
  "Output Customization",
  "Error Identification",
  "Improvement",
  "Interaction",
  "Context Control",
];

interface VerticalStepperProps {
  step: number;
  handleStep: (e: number) => void;
}

export const VerticalStepper: React.FC<VerticalStepperProps> = ({
  step,
  handleStep,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[11vh] gap-4 bg-background">
      <Stepper
        value={step}
        onChange={(event: StepperChangeEvent) => handleStep(event.value)}
        items={items}
        orientation="horizontal"
        style={{ width: "100%", backgroundColor: "transparent" }}
      />
      <h1 className="text-xl font-bold">{labels[step]}</h1>
    </div>
  );
};

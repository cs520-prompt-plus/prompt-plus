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
  { label: "Input Semantics", svgIcon: documentManagerIcon },
  { label: "Output Customization", svgIcon: sparklesIcon },
  { label: "Error Identification", svgIcon: dataIcon },
  { label: "Improvement", svgIcon: eyeIcon },
  { label: "Interaction", svgIcon: inheritedIcon },
  { label: "Context Control", svgIcon: gearIcon },
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
    <Stepper
      value={step}
      onChange={(event: StepperChangeEvent) => handleStep(event.value)}
      items={items}
      orientation="horizontal"
      style={{ width: "100%" }}
    />
  );
};

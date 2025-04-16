"use client";
import * as React from "react";
import { Stepper, StepperChangeEvent } from "@progress/kendo-react-layout";
import {
  documentManagerIcon,
  dataIcon,
  eyeIcon,
  gearIcon,
  inheritedIcon,
} from "@progress/kendo-svg-icons";

const items = [
  { label: "Input Context", svgIcon: documentManagerIcon },
  { label: "Motivation", svgIcon: gearIcon },
  { label: "Structure", svgIcon: dataIcon },
  { label: "Example", svgIcon: eyeIcon, optional: true },
  { label: "Consequence", svgIcon: inheritedIcon },
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

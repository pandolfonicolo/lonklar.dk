import React from "react";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  index < currentStep
                    ? "bg-[var(--nordic-accent)] text-white"
                    : index === currentStep
                    ? "bg-[var(--nordic-accent)] text-white ring-4 ring-[var(--nordic-accent-light)]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <p
                className={`mt-2 text-xs text-center ${
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors duration-200 ${
                  index < currentStep ? "bg-[var(--nordic-accent)]" : "bg-border"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

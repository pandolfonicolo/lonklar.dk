import React from "react";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  index < currentStep
                    ? "bg-[var(--nordic-accent)] text-white shadow-sm"
                    : index === currentStep
                    ? "bg-[var(--nordic-accent)] text-white ring-[3px] ring-[var(--nordic-accent)]/25"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <p
                className={`mt-2 text-xs text-center font-medium leading-tight ${
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step}
              </p>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 -mt-5">
                <div className="relative h-[2px] rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--nordic-accent)] transition-all duration-500 ease-out"
                    style={{ width: index < currentStep ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

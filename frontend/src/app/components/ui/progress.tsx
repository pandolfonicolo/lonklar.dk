"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border-subtle)',
        boxShadow: 'inset 0 1px 2px rgba(27,31,42,0.06)',
      }}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          background: 'var(--nordic-accent)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

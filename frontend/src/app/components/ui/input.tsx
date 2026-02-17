import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-[var(--nordic-accent)]/15 selection:text-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border border-border px-3 py-1 text-base bg-transparent transition-all duration-[120ms] ease-[cubic-bezier(0.2,0,0.38,0.9)] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[var(--nordic-accent)] focus-visible:ring-[2px] focus-visible:ring-[var(--nordic-accent)]/20 focus-visible:shadow-[0_0_0_1px_var(--nordic-accent)_inset]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      style={{boxShadow: 'var(--surface-inner-highlight)'}}
      {...props}
    />
  );
}

export { Input };

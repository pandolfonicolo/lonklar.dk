import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-[120ms] ease-[cubic-bezier(0.2,0,0.38,0.9)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[2px] focus-visible:ring-[var(--nordic-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(27,31,42,0.12),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-primary/90 hover:shadow-[0_2px_4px_rgba(27,31,42,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] hover:translate-y-[-0.5px] active:translate-y-0",
        destructive:
          "bg-destructive text-white shadow-[0_1px_2px_rgba(191,54,54,0.2)] hover:bg-destructive/90 hover:shadow-[0_2px_4px_rgba(191,54,54,0.25)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "bg-[var(--glass-bg-elevated)] text-foreground shadow-[var(--shadow-sm),inset_0_1px_0_rgba(255,255,255,0.5)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] hover:border-[rgba(74,111,165,0.25)] dark:bg-[#232938] dark:border-[#3A4255] dark:hover:bg-[#2A3142] dark:hover:border-[#4A5568] dark:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:bg-secondary/80",
        ghost:
          "hover:bg-[var(--glass-bg)] hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-[var(--nordic-accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

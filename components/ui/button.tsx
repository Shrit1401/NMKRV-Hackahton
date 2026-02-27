import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-tight transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          // Sleek, minimal, glass effect with gentle solid color and backdrop blur
          "bg-slate-900/75 text-slate-50 border border-slate-800/60 shadow-[0_1px_7px_rgba(22,28,50,0.17)] backdrop-blur-md hover:bg-slate-800/80 hover:border-slate-300/10 hover:shadow-[0_2px_16px_rgba(80,217,253,0.06)] active:bg-slate-900 active:border-slate-700/75 transition-all",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-[0_0_18px_rgba(127,29,29,0.15)]",
        outline:
          "bg-transparent border border-white/15 text-slate-100 shadow-[0_1px_8px_rgba(40,60,90,0.10)] hover:bg-slate-900/70 hover:border-white/25 hover:text-slate-50",
        secondary:
          // White background and black text for secondary
          "bg-white text-black border border-black/10 shadow-[0_1px_8px_rgba(42,57,97,0.10)] hover:bg-black hover:text-white hover:border-black/80 transition-all",
        ghost:
          "text-slate-300 hover:bg-slate-800/60 hover:text-slate-50 border border-transparent hover:border-slate-600/20",
        link: "text-sky-400 underline-offset-4 hover:text-sky-300 hover:underline bg-transparent border-none shadow-none",
      },
      size: {
        default: "h-10 px-5 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-full px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-full gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-11 rounded-full px-7 has-[>svg]:px-5",
        icon: "size-9 rounded-full",
        "icon-xs": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-11 rounded-full",
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
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ArchiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  variant?: "plain" | "square" | "icon" | "thumbnail" | "menu";
};

const variants = {
  plain:
    "inline-flex min-h-10 items-center justify-center gap-2 border border-border bg-background px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  square:
    "flex aspect-square w-28 flex-col items-start justify-between border border-control-border bg-control p-4 text-left text-control-foreground shadow-archive backdrop-blur-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-32",
  icon:
    "inline-flex size-10 shrink-0 items-center justify-center border border-control-border bg-control text-control-foreground shadow-archive backdrop-blur-sm transition-colors hover:bg-control-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  thumbnail:
    "relative aspect-[3/2] w-24 overflow-hidden border border-transparent bg-muted opacity-60 transition-all hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:border-foreground data-[active=true]:opacity-100 sm:w-28",
  menu:
    "flex w-full items-start justify-between gap-6 bg-transparent py-1 text-left font-serif text-[32px] leading-none text-foreground transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
} as const;

export function ArchiveButton({
  asChild,
  className,
  variant = "plain",
  ...props
}: ArchiveButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(variants[variant], className)} {...props} />;
}
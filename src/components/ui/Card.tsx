import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "glass-card rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_rgba(0,0,0,0.5)]",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

export const CardHover = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "glass-card rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_rgba(0,0,0,0.5)] transition-all duration-200",
        "hover:border-ink-500 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_16px_40px_-12px_rgba(255,255,255,0.06)]",
        className
      )}
      {...props}
    />
  );
});
CardHover.displayName = "CardHover";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-white text-ink-950 hover:bg-ink-50 active:bg-ink-100 disabled:bg-ink-600 disabled:text-ink-300",
  secondary:
    "bg-ink-800 text-white border border-ink-600 hover:bg-ink-700 active:bg-ink-600 disabled:bg-ink-850 disabled:text-ink-400",
  outline:
    "bg-transparent text-white border border-ink-600 hover:border-ink-400 hover:bg-ink-800/60 active:bg-ink-800 disabled:text-ink-400 disabled:border-ink-700",
  ghost:
    "bg-transparent text-ink-200 hover:bg-ink-800 hover:text-white active:bg-ink-700 disabled:text-ink-500",
  danger:
    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 active:bg-danger/25 disabled:opacity-40",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 gap-2 rounded-xl",
  lg: "text-base px-6 py-3 gap-2 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, iconRight, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 select-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "active:scale-[0.98] focus-ring",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = "Button";

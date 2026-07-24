import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({ content, children, className }: { content: string; children: ReactNode; className?: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-ink-800/95 backdrop-blur-sm border border-ink-600 px-2.5 py-1 text-xs text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] z-20 animate-fade-in">
          {content}
        </span>
      )}
    </span>
  );
}

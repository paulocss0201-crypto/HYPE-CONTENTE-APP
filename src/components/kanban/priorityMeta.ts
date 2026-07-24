import type { Priority } from "@/types";

export const PRIORITY_TONE: Record<Priority, "neutral" | "warning" | "danger"> = {
  baixa: "neutral",
  media: "neutral",
  alta: "warning",
  urgente: "danger",
};

export const PRIORITY_DOT: Record<Priority, string> = {
  baixa: "bg-ink-400",
  media: "bg-ink-100",
  alta: "bg-warning",
  urgente: "bg-danger",
};

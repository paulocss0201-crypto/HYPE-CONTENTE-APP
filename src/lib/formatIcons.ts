import { Clapperboard, Layers, CircleDot, FileText, type LucideIcon } from "lucide-react";
import type { ContentFormat } from "@/types";

export const FORMAT_ICON: Record<ContentFormat, LucideIcon> = {
  reels: Clapperboard,
  carousel: Layers,
  stories: CircleDot,
  post: FileText,
};

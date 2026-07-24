import type { ContentFormat, GeneratedContent, ObjectiveKey } from "@/types";

export interface GeneratorNavState {
  theme?: string;
  offer?: string;
  objective?: ObjectiveKey | string;
  audience?: string;
  tone?: string;
  creativity?: number;
  cta?: string;
  extra?: string;
  useBrandInfo?: boolean;
  autoGenerate?: boolean;
  transformedContent?: GeneratedContent;
  transformedTitle?: string;
  sourceFormat?: ContentFormat;
}

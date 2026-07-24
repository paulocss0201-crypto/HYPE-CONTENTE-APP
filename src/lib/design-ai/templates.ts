import type { DesignFormatKey } from "@/types/design";
import {
  layoutBoldStatement,
  layoutImageOverlay,
  layoutSplit,
  layoutQuoteCard,
  layoutNumbered,
  layoutMinimalFrame,
} from "./layouts";
import type { LayoutInput } from "./layouts";
import type { DesignPalette } from "./palette";

export type TemplateCategory =
  | "Educativo"
  | "Autoridade"
  | "Venda"
  | "Storytelling"
  | "Prova social"
  | "Lista"
  | "Tutorial"
  | "Lançamento"
  | "Oferta"
  | "Minimalista"
  | "Corporativo"
  | "Futurista"
  | "Elegante"
  | "Criativo";

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Educativo",
  "Autoridade",
  "Venda",
  "Storytelling",
  "Prova social",
  "Lista",
  "Tutorial",
  "Lançamento",
  "Oferta",
  "Minimalista",
  "Corporativo",
  "Futurista",
  "Elegante",
  "Criativo",
];

export interface DesignTemplate {
  id: string;
  category: TemplateCategory;
  name: string;
  layout: (input: LayoutInput) => { background: string; backgroundGradientTo?: string; elements: ReturnType<typeof layoutBoldStatement>["elements"] };
  palette: DesignPalette;
  formats: DesignFormatKey[];
}

const P = {
  mono: { bg: "#0a0a0a", bgTo: "#161616", accent: "#ffffff", text: "#ffffff" } as DesignPalette,
  soft: { bg: "#111111", accent: "#c9c9c9", text: "#ffffff" } as DesignPalette,
  contrast: { bg: "#0a0a0a", bgTo: "#242424", accent: "#a3a3a3", text: "#ffffff" } as DesignPalette,
  frame: { bg: "#161616", accent: "#ffffff", text: "#f5f5f5" } as DesignPalette,
};

export const TEMPLATES: DesignTemplate[] = [
  { id: "educativo-split", category: "Educativo", name: "Educativo — Split", layout: layoutSplit, palette: P.soft, formats: ["post-quadrado", "carrossel-quadrado", "story"] },
  { id: "educativo-numerado", category: "Educativo", name: "Educativo — Numerado", layout: layoutNumbered, palette: P.contrast, formats: ["carrossel-quadrado", "carrossel-vertical"] },
  { id: "autoridade-quote", category: "Autoridade", name: "Autoridade — Citação", layout: layoutQuoteCard, palette: P.mono, formats: ["post-quadrado", "post-vertical", "story"] },
  { id: "autoridade-frame", category: "Autoridade", name: "Autoridade — Moldura", layout: layoutMinimalFrame, palette: P.frame, formats: ["post-quadrado", "capa-reels"] },
  { id: "venda-bold", category: "Venda", name: "Venda — Statement", layout: layoutBoldStatement, palette: P.mono, formats: ["post-quadrado", "post-vertical", "story", "capa-reels"] },
  { id: "venda-overlay", category: "Venda", name: "Venda — Overlay", layout: layoutImageOverlay, palette: P.contrast, formats: ["story", "capa-reels", "post-vertical"] },
  { id: "storytelling-quote", category: "Storytelling", name: "Storytelling — Narrativa", layout: layoutQuoteCard, palette: P.soft, formats: ["post-quadrado", "carrossel-quadrado"] },
  { id: "prova-social-split", category: "Prova social", name: "Prova social — Depoimento", layout: layoutSplit, palette: P.frame, formats: ["post-quadrado", "post-vertical"] },
  { id: "lista-numerado", category: "Lista", name: "Lista — Item numerado", layout: layoutNumbered, palette: P.mono, formats: ["carrossel-quadrado", "carrossel-vertical"] },
  { id: "tutorial-numerado", category: "Tutorial", name: "Tutorial — Passo a passo", layout: layoutNumbered, palette: P.soft, formats: ["carrossel-quadrado", "carrossel-vertical"] },
  { id: "lancamento-bold", category: "Lançamento", name: "Lançamento — Anúncio", layout: layoutBoldStatement, palette: P.contrast, formats: ["post-quadrado", "story", "capa-reels"] },
  { id: "oferta-overlay", category: "Oferta", name: "Oferta — Destaque", layout: layoutImageOverlay, palette: P.mono, formats: ["story", "post-vertical"] },
  { id: "minimalista-frame", category: "Minimalista", name: "Minimalista — Clean", layout: layoutMinimalFrame, palette: P.frame, formats: ["post-quadrado", "post-vertical", "story"] },
  { id: "corporativo-split", category: "Corporativo", name: "Corporativo — Institucional", layout: layoutSplit, palette: P.frame, formats: ["post-quadrado", "carrossel-quadrado"] },
  { id: "futurista-bold", category: "Futurista", name: "Futurista — Tech", layout: layoutBoldStatement, palette: P.contrast, formats: ["post-quadrado", "story", "capa-reels"] },
  { id: "elegante-quote", category: "Elegante", name: "Elegante — Sofisticado", layout: layoutQuoteCard, palette: P.frame, formats: ["post-quadrado", "post-vertical"] },
  { id: "criativo-overlay", category: "Criativo", name: "Criativo — Expressivo", layout: layoutImageOverlay, palette: P.soft, formats: ["story", "capa-reels", "post-vertical"] },
];

export function templatesForFormat(formatKey: DesignFormatKey): DesignTemplate[] {
  return TEMPLATES.filter((t) => t.formats.includes(formatKey));
}

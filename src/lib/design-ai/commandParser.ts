import type { DesignFormatKey } from "@/types/design";

export type DesignCommandAction =
  | { type: "background"; color: string }
  | { type: "increase-title" }
  | { type: "decrease-title" }
  | { type: "center-all" }
  | { type: "reduce-text" }
  | { type: "simplify" }
  | { type: "adapt-format"; format: DesignFormatKey }
  | { type: "improve-hierarchy" }
  | { type: "modern-font" }
  | { type: "accent-color"; color: string }
  | { type: "generate-image" }
  | { type: "apply-brand" }
  | { type: "more-premium" }
  | { type: "analyze" }
  | { type: "unknown"; raw: string };

const COLOR_WORDS: Record<string, string> = {
  preto: "#0a0a0a",
  escuro: "#0a0a0a",
  branco: "#ffffff",
  cinza: "#7a7a7a",
  grafite: "#242424",
  azul: "#3b82f6",
  verde: "#22c55e",
  vermelho: "#ef4444",
  dourado: "#d4af37",
  rosa: "#ec4899",
  roxo: "#a855f7",
};

const FORMAT_WORDS: Record<string, DesignFormatKey> = {
  story: "story",
  stories: "story",
  reels: "capa-reels",
  "capa de reels": "capa-reels",
  carrossel: "carrossel-quadrado",
  post: "post-quadrado",
  quadrado: "post-quadrado",
  vertical: "post-vertical",
};

function findColor(text: string): string | undefined {
  for (const [word, hex] of Object.entries(COLOR_WORDS)) {
    if (text.includes(word)) return hex;
  }
  return undefined;
}

export function parseDesignCommand(raw: string): DesignCommandAction {
  const text = raw.trim().toLowerCase();
  if (!text) return { type: "unknown", raw };

  if (/fundo/.test(text)) {
    const color = findColor(text);
    if (color) return { type: "background", color };
  }

  if (/(destaque|acento|cor de destaque)/.test(text)) {
    const color = findColor(text);
    if (color) return { type: "accent-color", color };
  }

  if (/aument\w* .*t[íi]tulo|t[íi]tulo .*maior|maior destaque/.test(text)) return { type: "increase-title" };
  if (/diminu\w* .*t[íi]tulo|t[íi]tulo .*menor/.test(text)) return { type: "decrease-title" };
  if (/centraliz/.test(text)) return { type: "center-all" };
  if (/reduz\w* .*texto|menos texto|encurt/.test(text)) return { type: "reduce-text" };
  if (/minimalista|mais limpo|simplific|menos elementos/.test(text)) return { type: "simplify" };
  if (/melhor\w* .*hierarquia/.test(text)) return { type: "improve-hierarchy" };
  if (/fonte .*moderna|tipografia .*moderna/.test(text)) return { type: "modern-font" };
  if (/imagem ultrarrealista|adicione uma imagem|gerar imagem/.test(text)) return { type: "generate-image" };
  if (/identidade da (minha )?marca|estilo da marca/.test(text)) return { type: "apply-brand" };
  if (/premium|mais sofisticado|mais elegante/.test(text)) return { type: "more-premium" };
  if (/analis\w* (o )?design|avaliar design|pontua/.test(text)) return { type: "analyze" };

  for (const [word, key] of Object.entries(FORMAT_WORDS)) {
    if (text.includes(`para ${word}`) || text.includes(`adapt${text.includes("adapte") ? "e" : "ar"} ${word}`)) {
      return { type: "adapt-format", format: key };
    }
  }
  if (/adapt/.test(text)) {
    for (const [word, key] of Object.entries(FORMAT_WORDS)) {
      if (text.includes(word)) return { type: "adapt-format", format: key };
    }
  }

  return { type: "unknown", raw };
}

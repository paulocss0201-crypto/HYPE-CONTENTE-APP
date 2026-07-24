export interface DesignPalette {
  bg: string;
  bgTo?: string;
  accent: string;
  text: string;
}

export const PALETTES: DesignPalette[] = [
  { bg: "#0a0a0a", bgTo: "#161616", accent: "#ffffff", text: "#ffffff" },
  { bg: "#111111", accent: "#e5e5e5", text: "#ffffff" },
  { bg: "#0a0a0a", bgTo: "#242424", accent: "#a3a3a3", text: "#ffffff" },
  { bg: "#161616", accent: "#ffffff", text: "#f5f5f5" },
];

const KEYWORD_COLORS: { pattern: RegExp; color: string }[] = [
  { pattern: /preto|escuro|dark/i, color: "#0a0a0a" },
  { pattern: /branc/i, color: "#ffffff" },
  { pattern: /cinza|grafite/i, color: "#a3a3a3" },
  { pattern: /azul/i, color: "#3b82f6" },
  { pattern: /verde/i, color: "#22c55e" },
  { pattern: /vermelh/i, color: "#ef4444" },
  { pattern: /dourad|ouro|gold/i, color: "#d4af37" },
  { pattern: /rosa|pink/i, color: "#ec4899" },
  { pattern: /roxo|lilás|neon/i, color: "#a855f7" },
];

export function paletteFromPrompt(prompt: string, salt: number): DesignPalette {
  const found = KEYWORD_COLORS.filter((k) => k.pattern.test(prompt)).map((k) => k.color);
  const base = PALETTES[Math.floor(salt) % PALETTES.length];
  if (found.length === 0) return base;
  const accent = found.find((c) => c !== "#0a0a0a" && c !== "#ffffff") ?? found[0];
  return { ...base, accent };
}

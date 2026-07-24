export function pick<T>(arr: T[], salt = 0): T {
  const idx = Math.floor(rand(salt) * arr.length);
  return arr[Math.min(idx, arr.length - 1)];
}

// deterministic-ish pseudo random so re-renders don't flicker, but regenerate (new salt) changes result.
// Uses murmurhash3 fmix32 for good avalanche even between adjacent integer salts.
export function rand(salt: number): number {
  let x = Math.floor(salt * 1000) ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  x = x ^ (x >>> 16);
  return (x >>> 0) / 4294967296;
}

export function newSalt(): number {
  return Date.now() + Math.floor(Math.random() * 100000);
}

export function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function cleanTheme(theme: string): string {
  return theme.trim().replace(/\.$/, "");
}

export function fallback(value: string | undefined, alt: string): string {
  return value && value.trim().length > 0 ? value.trim() : alt;
}

export function firstSentence(text: string | undefined): string {
  if (!text) return "";
  const parts = text.split(/[.;\n]/).map((p) => p.trim()).filter(Boolean);
  return parts[0] ?? "";
}

export function listFromText(text: string | undefined, max = 3): string[] {
  if (!text) return [];
  return text
    .split(/[,;\n]/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function slugTag(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function hashtagsFor(theme: string, segment: string, extra: string[] = []): string[] {
  const base = [slugTag(theme), slugTag(segment)].filter(Boolean);
  const generic = ["conteudoestrategico", "instagram", "marketingdigital", "criadordeconteudo"];
  const all = [...base, ...extra.map(slugTag).filter(Boolean), ...generic];
  const unique = Array.from(new Set(all)).filter((t) => t.length > 2);
  return unique.slice(0, 8).map((t) => `#${t}`);
}

export const TONE_LABELS: Record<string, string> = {
  profissional: "profissional",
  educativo: "educativo",
  persuasivo: "persuasivo",
  inspirador: "inspirador",
  descontraido: "descontraído",
  provocativo: "provocativo",
  direto: "direto",
  elegante: "elegante",
};

export function shortenText(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 2))).join(" ");
}

export function persuasiveText(text: string): string {
  const boosters = ["Sem enrolação: ", "Prova real: ", "Isso funciona porque "];
  return `${boosters[Math.floor(Math.random() * boosters.length)]}${text}`;
}

export function professionalText(text: string): string {
  return text
    .replace(/\bpra\b/gi, "para")
    .replace(/\bvc\b/gi, "você")
    .replace(/!{2,}/g, ".")
    .trim();
}

export function fixGrammar(text: string): string {
  return text
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/([.!?])([A-ZÀ-Ú])/g, "$1 $2")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s*[a-zà-ú]/, (m) => m.toUpperCase())
    .trim();
}

export function strongerHeadline(text: string): string {
  const clean = text.replace(/[.!]+$/, "");
  const templates = [`${clean}. Ponto final.`, `${clean} — e ninguém te contou isso.`, `A verdade sobre: ${clean}`];
  return templates[Math.floor(Math.random() * templates.length)];
}

export function fitToSpace(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

import type { GeneratedContent } from "@/types";
import { buildHook, buildCta } from "./hooks";

export type RefineAction = "shorten" | "persuasive" | "professional" | "hook" | "cta";

function shortenText(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 2))).join(" ");
}

function persuasiveText(text: string): string {
  const boosters = ["Sem enrolação: ", "Prova real: ", "Isso funciona porque "];
  return `${boosters[Math.floor(Math.random() * boosters.length)]}${text}`;
}

function professionalText(text: string): string {
  return text
    .replace(/\bpra\b/gi, "para")
    .replace(/\bvc\b/gi, "você")
    .replace(/!{2,}/g, ".")
    .trim();
}

function transform(text: string, action: RefineAction): string {
  if (action === "shorten") return shortenText(text);
  if (action === "persuasive") return persuasiveText(text);
  if (action === "professional") return professionalText(text);
  return text;
}

export function refineContent(content: GeneratedContent, action: RefineAction, salt: number): GeneratedContent {
  if (action === "hook") {
    if (content.format === "reels") {
      const hook = buildHook({ theme: content.data.title, tone: "profissional", objective: content.data.objective, salt });
      return { format: "reels", data: { ...content.data, hook } };
    }
    if (content.format === "carousel") {
      const hook = buildHook({ theme: content.data.slides[0]?.title ?? "conteúdo", tone: "profissional", objective: "engajar", salt });
      return { format: "carousel", data: { ...content.data, captionHook: hook } };
    }
    const hook = buildHook({ theme: content.data.stories[0]?.mainText ?? "conteúdo", tone: "profissional", objective: "engajar", salt });
    return {
      format: "stories",
      data: { stories: content.data.stories.map((s, i) => (i === 0 ? { ...s, mainText: hook } : s)) },
    };
  }

  if (action === "cta") {
    if (content.format === "reels") {
      const cta = buildCta({ objective: content.data.objective, tone: "profissional", salt });
      return { format: "reels", data: { ...content.data, cta } };
    }
    if (content.format === "carousel") {
      const cta = buildCta({ objective: "engajar", tone: "profissional", salt });
      const slides = content.data.slides.map((s) => (s.role === "cta" ? { ...s, body: cta } : s));
      return { format: "carousel", data: { ...content.data, cta, slides } };
    }
    const cta = buildCta({ objective: "engajar", tone: "profissional", salt });
    return {
      format: "stories",
      data: { stories: content.data.stories.map((s) => (s.stage === "cta" ? { ...s, mainText: cta, cta } : s)) },
    };
  }

  if (content.format === "reels") {
    return {
      format: "reels",
      data: {
        ...content.data,
        hook: transform(content.data.hook, action),
        narrationFull: transform(content.data.narrationFull, action),
        caption: transform(content.data.caption, action),
        cta: transform(content.data.cta, action),
      },
    };
  }
  if (content.format === "carousel") {
    return {
      format: "carousel",
      data: {
        ...content.data,
        caption: transform(content.data.caption, action),
        slides: content.data.slides.map((s) => ({ ...s, body: transform(s.body, action) })),
      },
    };
  }
  return {
    format: "stories",
    data: {
      stories: content.data.stories.map((s) => ({
        ...s,
        mainText: transform(s.mainText, action),
        supportText: transform(s.supportText, action),
      })),
    },
  };
}

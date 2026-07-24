import type { GeneratedContent } from "@/types";
import { buildHook, buildCta } from "./hooks";
import { shortenText, persuasiveText, professionalText } from "./textTransforms";

export type RefineAction = "shorten" | "persuasive" | "professional" | "hook" | "cta";

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
    if (content.format === "stories") {
      const hook = buildHook({ theme: content.data.stories[0]?.mainText ?? "conteúdo", tone: "profissional", objective: "engajar", salt });
      return {
        format: "stories",
        data: { stories: content.data.stories.map((s, i) => (i === 0 ? { ...s, mainText: hook } : s)) },
      };
    }
    const hook = buildHook({ theme: content.data.title, tone: "profissional", objective: "engajar", salt });
    return { format: "post", data: { ...content.data, caption: hook } };
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
    if (content.format === "stories") {
      const cta = buildCta({ objective: "engajar", tone: "profissional", salt });
      return {
        format: "stories",
        data: { stories: content.data.stories.map((s) => (s.stage === "cta" ? { ...s, mainText: cta, cta } : s)) },
      };
    }
    const cta = buildCta({ objective: "engajar", tone: "profissional", salt });
    return { format: "post", data: { ...content.data, cta } };
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
  if (content.format === "stories") {
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
  return {
    format: "post",
    data: {
      ...content.data,
      caption: transform(content.data.caption, action),
      cta: transform(content.data.cta, action),
    },
  };
}

import type { BrandProfile, ContentFormat, GeneratedContent, GenerationRequest } from "@/types";
import { generateReel } from "./reels";
import { generateCarousel } from "./carousel";
import { generateStories } from "./stories";

function extractSummary(content: GeneratedContent): { theme: string; cta: string; extra: string } {
  if (content.format === "reels") {
    return { theme: content.data.title.replace(/:.*/, "").trim() || content.data.hook, cta: content.data.cta, extra: content.data.narrationFull };
  }
  if (content.format === "carousel") {
    const cover = content.data.slides[0];
    return { theme: cover?.title ?? "conteúdo", cta: content.data.cta, extra: content.data.slides.map((s) => s.body).join(" ") };
  }
  const first = content.data.stories[0];
  return { theme: first?.mainText ?? "conteúdo", cta: content.data.stories[content.data.stories.length - 1]?.cta ?? "", extra: content.data.stories.map((s) => s.mainText).join(" ") };
}

export function repurposeContent(
  content: GeneratedContent,
  targetFormat: ContentFormat,
  brand: BrandProfile,
  salt: number
): GeneratedContent {
  const { theme, cta, extra } = extractSummary(content);
  const req: GenerationRequest = {
    format: targetFormat,
    theme,
    objective: "engajar",
    tone: brand.tone || "profissional",
    creativity: 60,
    cta,
    extra,
    useBrandInfo: true,
    slideCount: 8,
    storyCount: 6,
    interactionType: "Enquete",
  };
  return runGeneration(req, brand, salt);
}

export function repurposeFromText(
  rawText: string,
  targetFormat: ContentFormat,
  brand: BrandProfile,
  salt: number
): GeneratedContent {
  const trimmed = rawText.trim();
  const firstLine = trimmed.split(/\n|\. /)[0]?.slice(0, 80) || "seu conteúdo";
  const req: GenerationRequest = {
    format: targetFormat,
    theme: firstLine,
    objective: "engajar",
    tone: brand.tone || "profissional",
    creativity: 60,
    extra: trimmed,
    useBrandInfo: true,
    slideCount: 8,
    storyCount: 6,
    interactionType: "Enquete",
  };
  return runGeneration(req, brand, salt);
}

export function runGeneration(req: GenerationRequest, brand: BrandProfile, salt: number): GeneratedContent {
  if (req.format === "reels") return { format: "reels", data: generateReel(req, brand, salt) };
  if (req.format === "carousel") return { format: "carousel", data: generateCarousel(req, brand, salt) };
  return { format: "stories", data: generateStories(req, brand, salt) };
}

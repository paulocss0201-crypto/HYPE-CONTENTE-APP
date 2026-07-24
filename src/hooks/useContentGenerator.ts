import { useState } from "react";
import type { GeneratedContent, GenerationRequest } from "@/types";
import { runGeneration, refineContent, newSalt } from "@/lib/ai";
import type { RefineAction } from "@/lib/ai";
import { useBrandStore } from "@/store/brandStore";

const GENERATION_DELAY = 3600;

export function useContentGenerator() {
  const brand = useBrandStore((s) => s.profile);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lastRequest, setLastRequest] = useState<GenerationRequest | null>(null);

  async function generate(req: GenerationRequest) {
    setGenerating(true);
    setLastRequest(req);
    await new Promise((r) => setTimeout(r, GENERATION_DELAY));
    const result = runGeneration(req, brand, newSalt());
    setContent(result);
    setGenerating(false);
    return result;
  }

  async function regenerateAll() {
    if (!lastRequest) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, GENERATION_DELAY));
    const result = runGeneration(lastRequest, brand, newSalt());
    setContent(result);
    setGenerating(false);
  }

  function refine(action: RefineAction) {
    if (!content) return;
    const result = refineContent(content, action, newSalt());
    setContent(result);
  }

  return { content, setContent, generating, generate, regenerateAll, refine };
}

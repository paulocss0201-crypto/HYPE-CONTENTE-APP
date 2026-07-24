import type { GeneratedContent } from "@/types";
import { STAGE_LABEL } from "@/lib/ai";

export function contentToText(content: GeneratedContent, title: string): string {
  const lines: string[] = [title, "".padEnd(title.length, "="), ""];

  if (content.format === "reels") {
    const d = content.data;
    lines.push(`OBJETIVO: ${d.objective}`, "", `GANCHO: ${d.hook}`, "", "ROTEIRO POR CENAS:");
    d.scenes.forEach((s) => {
      lines.push(`\nCena ${s.scene}`, `Visual: ${s.visual}`, `Texto na tela: ${s.onScreenText}`, `Fala/narração: ${s.narration}`);
    });
    lines.push("", `CHAMADA PARA AÇÃO: ${d.cta}`, "", `LEGENDA:\n${d.caption}`, "", `HASHTAGS: ${d.hashtags.join(" ")}`, "", `ÁUDIO: ${d.audioSuggestion}`, "", "DICAS DE GRAVAÇÃO:");
    d.recordingTips.forEach((t) => lines.push(`- ${t}`));
  } else if (content.format === "carousel") {
    const d = content.data;
    d.slides.forEach((s) => {
      lines.push(`\nSlide ${s.number} (${s.role})`, `Título: ${s.title}`, `Texto: ${s.body}`, `Sugestão visual: ${s.visual}`, `Observação de design: ${s.designNote}`);
    });
    lines.push("", `LEGENDA:\n${d.caption}`, "", `CHAMADA PARA AÇÃO: ${d.cta}`, "", `HASHTAGS: ${d.hashtags.join(" ")}`, "", `TÍTULO ALTERNATIVO: ${d.altTitle}`, `CAPA ALTERNATIVA: ${d.altCover}`);
  } else if (content.format === "stories") {
    const d = content.data;
    d.stories.forEach((s) => {
      lines.push(
        `\nStory ${s.number} — ${STAGE_LABEL[s.stage]}`,
        `Objetivo: ${s.objective}`,
        `Texto principal: ${s.mainText}`,
        `Texto de apoio: ${s.supportText}`,
        `Sugestão visual: ${s.visual}`,
        `Fundo: ${s.background}`,
        `Interação: ${s.interactive}`,
        s.cta ? `CTA: ${s.cta}` : ""
      );
    });
  } else {
    const d = content.data;
    lines.push(`LEGENDA:\n${d.caption}`, "", `CHAMADA PARA AÇÃO: ${d.cta}`, "", `OBSERVAÇÕES:\n${d.notes}`);
  }

  return lines.filter((l) => l !== undefined).join("\n");
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function downloadTextFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportAsDocument(text: string, title: string): void {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title>
    <style>
      body { font-family: 'Inter', Arial, sans-serif; padding: 48px; max-width: 720px; margin: 0 auto; color: #111; white-space: pre-wrap; line-height: 1.6; }
      h1 { font-size: 22px; margin-bottom: 24px; }
    </style>
  </head><body>${escapeHtml(text)}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
}

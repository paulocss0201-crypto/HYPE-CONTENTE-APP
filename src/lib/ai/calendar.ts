import type { CalendarEntry, ContentFormat } from "@/types";
import { addDays, format } from "date-fns";
import { pick } from "./helpers";
import { uid } from "@/lib/utils";

export interface CalendarGenParams {
  segment: string;
  objective: string;
  postsPerWeek: number;
  formats: ContentFormat[];
  weeks: number;
  offer: string;
  startDate: Date;
}

const PILLAR_ROTATION = [
  "Educação",
  "Autoridade",
  "Engajamento",
  "Relacionamento",
  "Quebra de objeção",
  "Oferta",
  "Venda",
];

export function generateCalendarPlan(params: CalendarGenParams, salt: number): CalendarEntry[] {
  const { segment, postsPerWeek, formats, weeks, offer, startDate } = params;
  const entries: CalendarEntry[] = [];
  const totalPosts = postsPerWeek * weeks;
  const dayStep = Math.max(Math.floor(7 / postsPerWeek), 1);
  const usedFormats = formats.length ? formats : (["reels", "carousel", "stories"] as ContentFormat[]);

  for (let i = 0; i < totalPosts; i++) {
    const pillar = PILLAR_ROTATION[i % PILLAR_ROTATION.length];
    const fmt = usedFormats[i % usedFormats.length];
    const date = addDays(startDate, i * dayStep);
    entries.push({
      id: uid("cal"),
      title: titleFor(pillar, segment, offer, salt + i),
      format: fmt,
      date: format(date, "yyyy-MM-dd"),
      time: pick(["09:00", "12:00", "18:00", "20:00"], salt + i),
      status: "idea",
      notes: `Pilar: ${pillar}`,
    });
  }
  return entries;
}

function titleFor(pillar: string, segment: string, offer: string, salt: number): string {
  const map: Record<string, string[]> = {
    Educação: [`Como funciona ${segment} na prática`, `O fundamento que todo mundo pula em ${segment}`],
    Autoridade: [`Por trás dos bastidores de ${segment}`, `O que anos de experiência me ensinaram sobre ${segment}`],
    Engajamento: [`Pergunta para o público sobre ${segment}`, `Enquete: qual sua maior dúvida sobre ${segment}?`],
    Relacionamento: [`Bastidores do dia a dia com ${segment}`, `Quem está por trás desse trabalho com ${segment}`],
    "Quebra de objeção": [`O mito mais comum sobre ${segment}`, `"Isso não funciona para mim" — será?`],
    Oferta: [offer ? `Conheça ${offer} de perto` : `Apresentando a solução`, `Os detalhes da nossa oferta atual`],
    Venda: [offer ? `Por que ${offer} é a escolha certa agora` : `Hora de fechar negócio`, `Últimas vagas / condição especial`],
  };
  const pool = map[pillar] ?? [`Conteúdo sobre ${segment}`];
  return pick(pool, salt);
}

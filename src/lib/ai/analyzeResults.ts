import type { AIAnalysis, BrandProfile, ContentMetrics, GeneratedContent } from "@/types";
import { pick } from "./helpers";

function extractTheme(content: GeneratedContent): { theme: string; hook: string; cta: string } {
  if (content.format === "reels") return { theme: content.data.title, hook: content.data.hook, cta: content.data.cta };
  if (content.format === "carousel") return { theme: content.data.slides[0]?.title ?? "conteúdo", hook: content.data.captionHook, cta: content.data.cta };
  if (content.format === "stories") return { theme: content.data.stories[0]?.mainText ?? "conteúdo", hook: content.data.stories[0]?.mainText ?? "", cta: content.data.stories[content.data.stories.length - 1]?.cta ?? "" };
  return { theme: content.data.title, hook: content.data.caption, cta: content.data.cta };
}

export function analyzeContentResults(
  metrics: ContentMetrics,
  content: GeneratedContent,
  brand: BrandProfile,
  salt: number
): AIAnalysis {
  const { theme } = extractTheme(content);
  const views = metrics.views ?? metrics.reach ?? 0;
  const engagement = (metrics.likes ?? 0) + (metrics.comments ?? 0) + (metrics.shares ?? 0) + (metrics.saves ?? 0);
  const rate = views > 0 ? engagement / views : 0;

  const tier: "baixo" | "medio" | "alto" = rate >= 0.08 ? "alto" : rate >= 0.02 ? "medio" : "baixo";

  const savesShare = engagement > 0 ? (metrics.saves ?? 0) / engagement : 0;
  const commentsShare = engagement > 0 ? (metrics.comments ?? 0) / engagement : 0;
  const sharesShare = engagement > 0 ? (metrics.shares ?? 0) / engagement : 0;

  let mainTrigger: string;
  if ((metrics.saves ?? 0) > 0 && savesShare >= commentsShare && savesShare >= sharesShare) {
    mainTrigger = `O valor prático do conteúdo sobre "${theme}" foi o principal gatilho — o público salvou para consultar depois, sinal de utilidade real.`;
  } else if ((metrics.comments ?? 0) > 0 && commentsShare >= sharesShare) {
    mainTrigger = `O gancho gerou identificação e debate: os comentários indicam que o tema "${theme}" tocou em algo relevante para o público.`;
  } else if ((metrics.shares ?? 0) > 0) {
    mainTrigger = `O conteúdo foi compartilhado com frequência — sinal de que "${theme}" tem apelo de identificação ou utilidade para o público repassar adiante.`;
  } else if ((metrics.newFollowers ?? 0) > 0) {
    mainTrigger = `O conteúdo atraiu novos seguidores, o que indica que o gancho funcionou para quem ainda não conhecia o perfil.`;
  } else {
    mainTrigger = `O alcance foi o principal resultado deste conteúdo sobre "${theme}", mas o engajamento direto ainda pode crescer.`;
  }

  const whatWorkedByTier: Record<string, string[]> = {
    alto: [
      `O gancho inicial prendeu a atenção rapidamente e o desenvolvimento manteve o público até o final — a taxa de engajamento ficou bem acima da média.`,
      `A combinação entre o tema "${theme}" e a chamada para ação direta gerou uma resposta forte do público.`,
    ],
    medio: [
      `O conteúdo teve um desempenho sólido, com engajamento dentro da média esperada para o tema "${theme}".`,
      `O público respondeu bem ao formato, mesmo sem viralizar — um resultado consistente.`,
    ],
    baixo: [
      `O conteúdo teve alcance, mas o engajamento ficou abaixo do esperado para o tema "${theme}".`,
      `O formato entregou a mensagem, porém não gerou tanta interação quanto poderia.`,
    ],
  };

  const whatToImproveByTier: Record<string, string[]> = {
    alto: [
      `Para manter esse nível, teste variações do mesmo gancho em outros temas do seu segmento.`,
      `Considere criar uma sequência ou parte 2 enquanto o tema ainda está gerando repercussão.`,
    ],
    medio: [
      `Fortalecer o gancho inicial e tornar a chamada para ação mais específica pode elevar o engajamento.`,
      `Testar um formato diferente (ex: transformar em outro tipo de conteúdo) para o mesmo tema pode ampliar o alcance.`,
    ],
    baixo: [
      `Revise o gancho inicial — os primeiros segundos provavelmente não seguraram a atenção do público.`,
      `Considere um tema mais específico e uma chamada para ação mais clara na próxima versão.`,
    ],
  };

  const elementsToReuseByTier: Record<string, string> = {
    alto: `Reaproveite o gancho, a estrutura de desenvolvimento e a chamada para ação — eles formam uma fórmula que já validou com esse público.`,
    medio: `O tema e o tom de voz funcionaram bem; vale reaproveitar o formato e ajustar apenas o gancho inicial.`,
    baixo: `O tema em si pode ser reaproveitado, mas vale reconstruir o gancho e a chamada para ação do zero.`,
  };

  const suggestionsPool = [
    `Criar uma nova versão de "${theme}" com um gancho mais direto.`,
    `Transformar esse conteúdo em outro formato para alcançar um público diferente.`,
    `Aprofundar um dos pontos do conteúdo em uma publicação dedicada.`,
    `Convidar o público a comentar uma dúvida específica sobre o tema.`,
    `Criar uma sequência de Stories mostrando bastidores relacionados ao tema.`,
    `Adicionar prova social (depoimento ou resultado real) na próxima versão.`,
  ];

  const similarIdeasPool = [
    `Os erros mais comuns relacionados a "${theme}"`,
    `Antes e depois aplicando o que foi ensinado sobre "${theme}"`,
    `Perguntas frequentes do público sobre "${theme}"`,
    `Bastidores de como ${brand.brandName || "a marca"} aplica isso na prática`,
    `Uma versão aprofundada de "${theme}" em formato de carrossel`,
  ];

  function sample(pool: string[], count: number, offset: number): string[] {
    const result: string[] = [];
    for (let i = 0; i < count; i++) result.push(pool[(i + offset) % pool.length]);
    return result;
  }

  return {
    whatWorked: pick(whatWorkedByTier[tier], salt),
    whatToImprove: pick(whatToImproveByTier[tier], salt + 1),
    mainTrigger,
    elementsToReuse: elementsToReuseByTier[tier],
    suggestions: sample(suggestionsPool, 3, Math.floor(salt) % suggestionsPool.length),
    similarIdeas: sample(similarIdeasPool, 3, Math.floor(salt + 2) % similarIdeasPool.length),
  };
}

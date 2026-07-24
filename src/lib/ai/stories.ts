import type { BrandProfile, GenerationRequest, StoriesContent, StorySlide } from "@/types";
import { cleanTheme, fallback, pick } from "./helpers";
import { buildCta, buildHook } from "./hooks";
import { uid } from "@/lib/utils";

const STAGES: StorySlide["stage"][] = ["gancho", "identificacao", "desenvolvimento", "interacao", "solucao", "cta"];

const STAGE_LABEL: Record<StorySlide["stage"], string> = {
  gancho: "Gancho",
  identificacao: "Identificação",
  desenvolvimento: "Desenvolvimento",
  interacao: "Interação",
  solucao: "Apresentação da solução",
  cta: "Chamada para ação",
};

export function generateStories(req: GenerationRequest, brand: BrandProfile, salt: number): StoriesContent {
  const theme = cleanTheme(req.theme);
  const audience = req.useBrandInfo ? fallback(req.audience, brand.audience) : req.audience ?? "";
  const tone = req.tone || brand.tone || "profissional";
  const painPoint = req.useBrandInfo ? brand.painPoints : "";
  const desire = req.useBrandInfo ? brand.desires : "";
  const offer = fallback(req.offer, brand.offer);
  const interaction = req.interactionType || "Enquete";
  const count = Math.max(req.storyCount ?? 5, STAGES.length);

  const hook = buildHook({ theme, audience, tone, objective: req.objective, painPoint, desire, salt });
  const cta = buildCta({ objective: req.objective, cta: req.cta, brandCta: brand.mainCta, tone, salt });

  const stageSequence = expandStages(count);

  const stories: StorySlide[] = stageSequence.map((stage, i) => buildStory(stage, i + 1, {
    theme, audience, tone, painPoint, desire, offer, interaction, hook, cta, salt,
  }));

  return { stories };
}

function expandStages(count: number): StorySlide["stage"][] {
  if (count <= STAGES.length) return STAGES.slice(0, count);
  const extra = count - STAGES.length;
  const result = [...STAGES];
  for (let i = 0; i < extra; i++) {
    result.splice(2 + i, 0, "desenvolvimento");
  }
  return result;
}

interface Ctx {
  theme: string;
  audience: string;
  tone: string;
  painPoint: string;
  desire: string;
  offer: string;
  interaction: string;
  hook: string;
  cta: string;
  salt: number;
}

function buildStory(stage: StorySlide["stage"], number: number, ctx: Ctx): StorySlide {
  const builders: Record<StorySlide["stage"], () => Omit<StorySlide, "id" | "number" | "stage">> = {
    gancho: () => ({
      objective: "Capturar atenção nos primeiros segundos",
      mainText: ctx.hook,
      supportText: "Arrasta para cima para saber mais",
      visual: "Foto ou vídeo curto olhando para a câmera, texto grande centralizado.",
      background: "Fundo escuro com destaque no rosto/produto, alto contraste.",
      interactive: "Sem interação — foco total na atenção.",
      cta: "",
    }),
    identificacao: () => ({
      objective: "Gerar identificação com a dor do público",
      mainText: ctx.painPoint
        ? `Se você já sentiu que ${ctx.painPoint.toLowerCase()}, você não está sozinho.`
        : `Quem trabalha com ${ctx.theme} já passou por isso em algum momento.`,
      supportText: "Isso é mais comum do que parece.",
      visual: "Imagem que represente o dia a dia do público, tom mais próximo e pessoal.",
      background: "Fundo neutro, foto real (não estoque) sempre que possível.",
      interactive: "Caixa de perguntas: 'Já passou por isso?'",
      cta: "",
    }),
    desenvolvimento: () => ({
      objective: "Explicar o raciocínio ou contexto",
      mainText: pick([
        `Aqui está o que realmente importa sobre ${ctx.theme}.`,
        `O ponto principal que muda essa história é este.`,
        `Deixa eu te explicar rapidinho como isso funciona.`,
      ], ctx.salt + number),
      supportText: pick(["Continua vendo os próximos stories.", "Vem que eu te explico."], ctx.salt + number),
      visual: "Texto em bloco sobre fundo sólido, ou vídeo curto explicando o ponto.",
      background: "Cor de apoio da marca, contraste alto para leitura rápida.",
      interactive: "Sem interação neste momento — foco na mensagem.",
      cta: "",
    }),
    interacao: () => ({
      objective: "Gerar interação e aumentar o alcance",
      mainText: interactionPrompt(ctx.interaction, ctx.theme),
      supportText: "Sua resposta ajuda a gente a te entender melhor.",
      visual: "Elemento interativo do Instagram centralizado, texto de apoio acima.",
      background: "Fundo simples para não competir com o elemento interativo.",
      interactive: ctx.interaction,
      cta: "",
    }),
    solucao: () => ({
      objective: "Apresentar a solução, produto ou serviço",
      mainText: ctx.offer
        ? `É exatamente isso que ${ctx.offer} resolve.`
        : ctx.desire
        ? `A solução para chegar em "${ctx.desire.toLowerCase()}" está mais perto do que parece.`
        : `A solução para isso é mais simples do que parece — e eu posso te ajudar.`,
      supportText: "Continua para saber como funciona.",
      visual: "Foto do produto/serviço em uso, ou depoimento/prova social em destaque.",
      background: "Fundo com identidade visual da marca.",
      interactive: "Controle deslizante: 'O quanto isso faz sentido para você?'",
      cta: "",
    }),
    cta: () => ({
      objective: "Converter a atenção em ação",
      mainText: ctx.cta,
      supportText: "Toca no link ou manda mensagem agora.",
      visual: "Botão ou seta apontando para o link/adesivo de link, texto grande e direto.",
      background: "Cor de destaque única, para chamar atenção nos últimos segundos.",
      interactive: "Link externo ou 'Responder no direct'",
      cta: ctx.cta,
    }),
  };
  return { id: uid("story"), number, stage, ...builders[stage]() };
}

function interactionPrompt(interaction: string, theme: string): string {
  const map: Record<string, string> = {
    Enquete: `Enquete rápida: você já tentou resolver ${theme} sozinho? Sim / Não`,
    "Caixa de perguntas": `Manda sua maior dúvida sobre ${theme} aqui embaixo.`,
    Quiz: `Testa seu conhecimento: você sabe o que realmente importa em ${theme}?`,
    "Controle deslizante": `Desliza para me contar o quanto isso faz sentido para você.`,
    "Resposta no direct": `Manda um direct com a palavra-chave e continuamos essa conversa lá.`,
    "Link externo": `Clica no link para ver o conteúdo completo sobre ${theme}.`,
    "Sem interação": `Continua acompanhando os próximos stories.`,
  };
  return map[interaction] ?? map["Enquete"];
}

export { STAGE_LABEL };

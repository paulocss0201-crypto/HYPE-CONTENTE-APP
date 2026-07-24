import type { BrandProfile, ContentFormat, IdeaCard } from "@/types";
import { fallback, pick, rand } from "./helpers";
import { uid } from "@/lib/utils";

const CATEGORIES = [
  "Conteúdo educativo",
  "Autoridade",
  "Engajamento",
  "Venda",
  "Storytelling",
  "Bastidores",
  "Quebra de objeção",
  "Prova social",
  "Tendências",
  "Conteúdo viral",
];

const FORMATS: ContentFormat[] = ["reels", "carousel", "stories"];

const IDEA_TEMPLATES: Record<string, (segment: string, audience: string, offer: string) => { title: string; description: string; hook: string }[]> = {
  "Conteúdo educativo": (segment) => [
    { title: `3 fundamentos de ${segment} que todo iniciante ignora`, description: `Explique conceitos básicos que parecem óbvios mas mudam o resultado.`, hook: `Ninguém te explicou isso sobre ${segment} do jeito certo.` },
  ],
  Autoridade: (segment) => [
    { title: `O que aprendi depois de anos trabalhando com ${segment}`, description: `Compartilhe uma lição prática que só a experiência ensina.`, hook: `Isso só se aprende na prática — e eu aprendi do jeito difícil.` },
  ],
  Engajamento: (segment, audience) => [
    { title: `A pergunta que divide opiniões sobre ${segment}`, description: `Faça uma pergunta provocativa para ${audience || "seu público"} responder nos comentários.`, hook: `Isso vai gerar discussão nos comentários — e é o objetivo.` },
  ],
  Venda: (segment, audience, offer) => [
    { title: `Por que ${offer || "essa solução"} é diferente de tudo que existe`, description: `Apresente o diferencial competitivo de forma direta.`, hook: `Você já deve ter visto algo parecido, mas não assim.` },
  ],
  Storytelling: (segment) => [
    { title: `A história por trás de como comecei com ${segment}`, description: `Conte uma virada pessoal que se conecta com o momento do público.`, hook: `Isso quase não deu certo — e a virada mudou tudo.` },
  ],
  Bastidores: (segment) => [
    { title: `Um dia nos bastidores de quem trabalha com ${segment}`, description: `Mostre o processo real, sem filtro, por trás do resultado final.`, hook: `Isso é o que ninguém mostra sobre o dia a dia com ${segment}.` },
  ],
  "Quebra de objeção": (segment) => [
    { title: `"Isso não funciona para mim" — um mito sobre ${segment}`, description: `Derrube a objeção mais comum com argumento e exemplo prático.`, hook: `Essa desculpa está te impedindo de começar — e não é verdade.` },
  ],
  "Prova social": (segment, audience) => [
    { title: `O resultado real de quem aplicou isso em ${segment}`, description: `Traga um case ou depoimento que comprove o método.`, hook: `Isso aconteceu com alguém como ${audience || "você"}.` },
  ],
  Tendências: (segment) => [
    { title: `O que está mudando em ${segment} agora`, description: `Comente uma tendência recente e o que fazer a respeito.`, hook: `Se você não sabe disso ainda, precisa saber agora.` },
  ],
  "Conteúdo viral": (segment) => [
    { title: `A regra dos 3 segundos aplicada a ${segment}`, description: `Use um formato de alto potencial de compartilhamento sobre o tema.`, hook: `Isso pode ser o conteúdo que mais viraliza no seu perfil.` },
  ],
};

export function generateIdeas(params: {
  count: number;
  objective: string;
  format: ContentFormat | "todos";
  theme: string;
  creativity: number;
  brand: BrandProfile;
  salt: number;
}): IdeaCard[] {
  const { count, format, theme, brand, salt } = params;
  const segment = fallback(theme, brand.segment) || "seu nicho";
  const audience = brand.audience;
  const offer = brand.offer;

  const categoryOrder = shuffledCategories(salt);

  const ideas: IdeaCard[] = [];
  for (let i = 0; i < count; i++) {
    const category = categoryOrder[i % categoryOrder.length];
    const templateFn = IDEA_TEMPLATES[category];
    const templates = templateFn(segment, audience, offer);
    const template = pick(templates, salt + i);
    const ideaFormat = format === "todos" ? pick(FORMATS, salt + i * 2) : format;
    ideas.push({
      id: uid("idea"),
      title: template.title,
      format: ideaFormat,
      objective: params.objective || pick(["Educar", "Engajar", "Vender", "Gerar autoridade"], salt + i),
      description: template.description,
      hook: template.hook,
      category,
    });
  }
  return ideas;
}

function shuffledCategories(salt: number): string[] {
  const arr = [...CATEGORIES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand(salt + i * 13) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

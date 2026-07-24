import type { BrandProfile, CarouselContent, CarouselSlide, GenerationRequest } from "@/types";
import { capitalize, cleanTheme, fallback, hashtagsFor, listFromText, pick } from "./helpers";
import { buildCta, buildHook } from "./hooks";
import { uid } from "@/lib/utils";

export function generateCarousel(req: GenerationRequest, brand: BrandProfile, salt: number): CarouselContent {
  const theme = cleanTheme(req.theme);
  const audience = req.useBrandInfo ? fallback(req.audience, brand.audience) : req.audience ?? "";
  const tone = req.tone || brand.tone || "profissional";
  const painPoint = req.useBrandInfo ? brand.painPoints : "";
  const desire = req.useBrandInfo ? brand.desires : "";
  const differentiators = listFromText(req.useBrandInfo ? brand.differentiators : "", 3);
  const offer = fallback(req.offer, brand.offer);
  const count = req.slideCount ?? 8;

  const hook = buildHook({ theme, audience, tone, objective: req.objective, painPoint, desire, salt });
  const cta = buildCta({ objective: req.objective, cta: req.cta, brandCta: brand.mainCta, tone, salt });

  const devCount = Math.max(count - 4, 1);
  const devPoints = developmentPoints(theme, painPoint, differentiators, devCount, salt);

  const slides: CarouselSlide[] = [];

  slides.push({
    id: uid("slide"),
    number: 1,
    role: "capa",
    title: coverHeadline(theme, hook, salt),
    body: pick([
      "Arrasta para o lado e aplica ainda hoje.",
      "Um guia rápido e direto ao ponto.",
      "Salva esse carrossel antes de continuar.",
    ], salt),
    visual: "Capa com fundo escuro, título grande centralizado e ícone de seta indicando 'arraste para o lado'.",
    designNote: "Use contraste alto entre texto e fundo, fonte em negrito, respiro nas bordas.",
  });

  slides.push({
    id: uid("slide"),
    number: 2,
    role: "problema",
    title: pick([`O problema com ${theme}`, `Por que isso trava tanta gente`, `A dor real por trás disso`], salt + 1),
    body: painPoint
      ? `Se você já sentiu que ${painPoint.toLowerCase()}, o motivo provavelmente não é o que você imagina.`
      : `A maioria das pessoas erra em ${theme} por seguir conselhos genéricos que não consideram o próprio contexto.`,
    visual: "Imagem ou ilustração representando frustração/dúvida, texto em destaque no topo.",
    designNote: "Use um tom mais sóbrio aqui — é o momento de gerar identificação, não empolgação.",
  });

  devPoints.forEach((point, i) => {
    slides.push({
      id: uid("slide"),
      number: 3 + i,
      role: "desenvolvimento",
      title: point.title,
      body: point.body,
      visual: `Ilustração ou foto relacionada a "${point.title}", com ícone de apoio.`,
      designNote: "Mantenha um conceito por slide — não sobrecarregue com muito texto.",
    });
  });

  const transformationIndex = slides.length + 1;
  slides.push({
    id: uid("slide"),
    number: transformationIndex,
    role: "transformacao",
    title: pick(["O resultado que isso gera", "O que muda a partir de agora", "A transformação real"], salt + 2),
    body: desire
      ? `Quando você aplica isso, o caminho para ${desire.toLowerCase()} fica muito mais curto.`
      : `Aplicando esses pontos, ${theme} deixa de ser um obstáculo e passa a ser um diferencial competitivo.`,
    visual: "Imagem de resultado positivo, cores mais claras para transmitir leveza.",
    designNote: "Use um elemento visual que contraste com o slide do 'problema', reforçando a virada.",
  });

  slides.push({
    id: uid("slide"),
    number: slides.length + 1,
    role: "cta",
    title: pick(["Bora colocar em prática?", "Pronto para o próximo passo?", "Não fica só na teoria"], salt + 3),
    body: `${cta}${offer ? ` Conheça ${offer}.` : ""}`,
    visual: "Fundo com destaque, botão ou seta apontando para a bio/comentários.",
    designNote: "CTA precisa ser o elemento mais visível do slide — use cor de destaque única do carrossel.",
  });

  return {
    slides,
    caption: buildCarouselCaption(theme, hook, cta, salt),
    captionHook: hook,
    cta,
    hashtags: hashtagsFor(theme, brand.segment, differentiators),
    altTitle: pick([`${capitalize(theme)}: o guia direto ao ponto`, `Tudo sobre ${theme} em ${count} slides`, `O que ninguém te contou sobre ${theme}`], salt + 4),
    altCover: pick([
      "Capa com número grande do total de slides + palavra-chave em destaque.",
      "Capa com pergunta provocativa relacionada ao tema, fundo minimalista.",
      "Capa com lista numerada visível ('5 erros sobre...') para gerar curiosidade.",
    ], salt + 5),
  };
}

function coverHeadline(theme: string, _hook: string, salt: number): string {
  const templates = [
    `O que fazer com ${theme} (sem complicar)`,
    `${theme[0]?.toUpperCase()}${theme.slice(1)}: o guia que faltava`,
    `Ninguém te explicou ${theme} assim`,
    `Pare de errar em ${theme}`,
  ];
  return pick(templates, salt);
}

function developmentPoints(theme: string, painPoint: string, differentiators: string[], count: number, salt: number) {
  const base = [
    { title: "O primeiro passo que muda tudo", body: `Antes de qualquer tática, entenda o fundamento de ${theme} — é o que sustenta todo o resto.` },
    { title: "O erro mais comum", body: `Boa parte das pessoas foca no que é visível e ignora o que realmente gera resultado em ${theme}.` },
    { title: "Como aplicar na prática", body: `Divida em etapas pequenas: comece pelo que está mais próximo do seu objetivo com ${theme} hoje.` },
    { title: "O que os resultados mostram", body: `Quem aplica esse processo de forma consistente vê diferença já nas primeiras semanas.` },
    { title: "Um detalhe que faz diferença", body: `Pequenos ajustes na forma como você conduz ${theme} evitam retrabalho e frustração.` },
    { title: "Adapte à sua realidade", body: `Não existe fórmula única — ajuste o ritmo ao seu contexto e ao do seu público.` },
  ];
  const withDiff = differentiators.length
    ? [{ title: "O que torna isso diferente", body: `${differentiators[0]} é o que faz esse processo funcionar mesmo quando outras abordagens falham.` }]
    : [];
  const pool = [...withDiff, ...base];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(i + Math.floor(salt % pool.length)) % pool.length]);
  }
  return result;
}

function buildCarouselCaption(theme: string, hook: string, cta: string, salt: number): string {
  const intro = pick([
    `${hook}`,
    `Ninguém fala sobre ${theme} desse jeito, mas devia.`,
  ], salt);
  const body = pick([
    `Reuni os pontos principais nesse carrossel para você aplicar sem complicação. Arrasta para o lado e salva para consultar depois.`,
    `Separei o passo a passo direto ao ponto — sem enrolação, sem termo técnico difícil.`,
  ], salt + 1);
  return `${intro}\n\n${body}\n\n${cta}`;
}

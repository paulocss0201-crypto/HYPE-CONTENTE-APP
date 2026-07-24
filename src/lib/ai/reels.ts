import type { GenerationRequest, ReelContent, ReelScene } from "@/types";
import type { BrandProfile } from "@/types";
import { capitalize, cleanTheme, fallback, hashtagsFor, pick, listFromText } from "./helpers";
import { buildCta, buildHook } from "./hooks";

const STYLE_SCENE_TEMPLATES: Record<string, (theme: string, salt: number) => string[]> = {
  "Falando para a câmera": (theme) => [
    `Você olha direto para a câmera e entrega o gancho sobre ${theme} com energia.`,
    `Você desenvolve o primeiro ponto, com corte seco para reforçar o ritmo.`,
    `Você apresenta o segundo ponto, usando as mãos para reforçar a explicação.`,
    `Você resume a ideia principal em uma frase de efeito.`,
    `Você olha para a câmera e faz a chamada para ação.`,
  ],
  "Vídeo narrado": (theme) => [
    `Imagens de contexto sobre ${theme} enquanto a narração apresenta o gancho.`,
    `Sequência de imagens ilustrando o primeiro argumento, narração explicando o "porquê".`,
    `Imagens de apoio para o segundo argumento, com narração aprofundando o raciocínio.`,
    `Tela com resultado ou resumo visual, narração reforçando o benefício.`,
    `Tela final com chamada para ação em destaque.`,
  ],
  Storytelling: (theme) => [
    `Cena de abertura mostrando a situação inicial ligada a ${theme}, tom intrigante.`,
    `Momento de virada: o problema fica evidente.`,
    `Ponto de tensão: a tentativa de solução que não deu certo.`,
    `A virada: a solução real aparece e tudo muda.`,
    `Fechamento com aprendizado e chamada para ação.`,
  ],
  Tutorial: (theme) => [
    `Introdução mostrando o resultado final que será ensinado sobre ${theme}.`,
    `Passo 1 explicado de forma clara e direta.`,
    `Passo 2, mostrando na prática o que fazer.`,
    `Passo 3, com a dica que a maioria erra.`,
    `Resultado final e chamada para ação.`,
  ],
  Lista: (theme) => [
    `Você anuncia a lista sobre ${theme} com um número chamativo.`,
    `Item 1 da lista, explicado rapidamente.`,
    `Item 2 da lista, com um exemplo prático.`,
    `Item 3 da lista, o mais importante, com destaque.`,
    `Encerramento reforçando o item mais valioso e chamada para ação.`,
  ],
  "Antes e depois": (theme) => [
    `Mostra o cenário "antes", com a dor relacionada a ${theme} evidente.`,
    `Explica o que estava travando esse resultado.`,
    `Mostra a mudança sendo aplicada.`,
    `Mostra o cenário "depois", com o resultado alcançado.`,
    `Convite para quem quer o mesmo resultado, com chamada para ação.`,
  ],
  "Quebra de objeção": (theme) => [
    `Você apresenta a objeção mais comum sobre ${theme}.`,
    `Você explica por que essa crença é um mito.`,
    `Você mostra a prova ou o raciocínio que derruba a objeção.`,
    `Você reforça o novo ponto de vista.`,
    `Chamada para ação convidando a pessoa a agir apesar da objeção.`,
  ],
  "Conteúdo educativo": (theme) => [
    `Abertura com o gancho educativo sobre ${theme}.`,
    `Primeiro conceito explicado com clareza.`,
    `Segundo conceito, com exemplo prático.`,
    `Erro comum que as pessoas cometem nesse processo.`,
    `Resumo do aprendizado e chamada para ação.`,
  ],
  "Conteúdo de venda": (theme) => [
    `Gancho apresentando a dor que o produto/serviço resolve.`,
    `Apresentação da solução relacionada a ${theme}.`,
    `Prova ou argumento que sustenta a solução.`,
    `Diferencial competitivo em destaque.`,
    `Chamada para ação direta para a venda.`,
  ],
  "Conteúdo de autoridade": (theme) => [
    `Abertura mostrando experiência ou resultado com ${theme}.`,
    `Explicação do raciocínio por trás do resultado.`,
    `Detalhe técnico que reforça o domínio do assunto.`,
    `Bastidor ou aprendizado prático.`,
    `Convite para seguir e acompanhar mais conteúdos, com chamada para ação.`,
  ],
  "Conteúdo polêmico": (theme) => [
    `Afirmação direta e polêmica sobre ${theme}.`,
    `Justificativa do porquê dessa opinião.`,
    `Contra-argumento ao que "todo mundo diz".`,
    `Exemplo prático que sustenta o ponto de vista.`,
    `Convite à reflexão e chamada para ação nos comentários.`,
  ],
  "Vídeo sem aparecer": (theme) => [
    `Tela com texto forte apresentando o gancho sobre ${theme}, imagens de apoio.`,
    `Tela com o primeiro ponto em destaque, b-roll relacionado.`,
    `Tela com o segundo ponto, ritmo de corte acelerado.`,
    `Tela com resumo visual do conteúdo.`,
    `Tela final com chamada para ação em texto grande.`,
  ],
};

function toneVerb(tone: string): string {
  const map: Record<string, string> = {
    profissional: "com clareza e segurança",
    educativo: "de forma didática",
    persuasivo: "com argumentos fortes",
    inspirador: "com energia positiva",
    descontraido: "de um jeito leve e natural",
    provocativo: "de forma direta e provocativa",
    direto: "sem enrolação",
    elegante: "com elegância e precisão",
  };
  return map[tone] ?? "com naturalidade";
}

export function generateReel(req: GenerationRequest, brand: BrandProfile, salt: number): ReelContent {
  const theme = cleanTheme(req.theme);
  const audience = req.useBrandInfo ? fallback(req.audience, brand.audience) : req.audience ?? "";
  const tone = req.tone || brand.tone || "profissional";
  const painPoint = req.useBrandInfo ? brand.painPoints : "";
  const desire = req.useBrandInfo ? brand.desires : "";
  const offer = fallback(req.offer, brand.offer);

  const hook = buildHook({ theme, audience, tone, objective: req.objective, painPoint, desire, salt });
  const style = req.style || "Falando para a câmera";
  const sceneTemplate = STYLE_SCENE_TEMPLATES[style] ?? STYLE_SCENE_TEMPLATES["Falando para a câmera"];
  const sceneDescriptions = sceneTemplate(theme, salt);

  const scenes: ReelScene[] = sceneDescriptions.map((visual, i) => ({
    scene: i + 1,
    visual,
    onScreenText: onScreenTextFor(i, theme, salt),
    narration: narrationLineFor(i, theme, tone, offer, audience, salt),
  }));

  const cta = buildCta({ objective: req.objective, cta: req.cta, brandCta: brand.mainCta, tone, salt });

  const narrationFull = scenes.map((s) => s.narration).join(" ");

  const title = `${capitalize(theme)}: roteiro para Reels`;

  const caption = buildCaption(theme, hook, cta, tone, salt);

  return {
    title,
    objective: req.objective,
    hook,
    scenes,
    narrationFull,
    visualSuggestions: scenes.map((s) => s.visual),
    onScreenTextSuggestions: scenes.map((s) => s.onScreenText),
    cta,
    caption,
    hashtags: hashtagsFor(theme, brand.segment, listFromText(brand.differentiators, 2)),
    audioSuggestion: audioSuggestionFor(style, tone, salt),
    recordingTips: recordingTips(style),
  };
}

function onScreenTextFor(index: number, theme: string, salt: number): string {
  const first = [`Você não sabia disso sobre ${theme}`, `Presta atenção nisso`, `Isso muda tudo`];
  const middle = [`Ponto ${index}`, `Segue o raciocínio`, `Anota isso`];
  const last = [`Salva esse vídeo`, `Me segue para mais`, `Comenta aqui embaixo`];
  if (index === 0) return pick(first, salt + index);
  if (index >= 3) return pick(last, salt + index);
  return pick(middle, salt + index);
}

function narrationLineFor(index: number, theme: string, tone: string, offer: string, audience: string, salt: number): string {
  const verb = toneVerb(tone);
  const lines = [
    `Fala ${verb} sobre por que ${theme} trava tanta gente que trabalha com ${audience || "isso"}.`,
    `Explica o primeiro ponto essencial, mostrando o raciocínio ${verb}.`,
    `Aprofunda o segundo ponto, conectando com ${offer || "a solução"} quando fizer sentido.`,
    `Reforça o benefício principal em uma frase curta e marcante.`,
    `Fecha convidando a pessoa a agir agora, ${verb}.`,
  ];
  return lines[index] ?? pick(lines, salt + index);
}

function buildCaption(theme: string, hook: string, cta: string, tone: string, salt: number): string {
  const openers = [
    `${capitalize(theme)} não precisa ser complicado.`,
    `Sobre ${theme}: o que ninguém te conta.`,
    `Vamos falar sobre ${theme} sem enrolação.`,
  ];
  const body = [
    `Separei os pontos principais para você aplicar hoje mesmo, sem complicação.`,
    `Esse é o processo que uso na prática — direto ao ponto, sem enrolação.`,
    `Se você chegou até aqui, é porque isso faz sentido para o seu momento agora.`,
  ];
  return `${pick(openers, salt)}\n\n${pick(body, salt + 1)}\n\n${cta}`;
}

function audioSuggestionFor(style: string, tone: string, salt: number): string {
  if (style === "Storytelling" || tone === "inspirador") {
    return pick(["Trilha instrumental suave, crescendo no clímax da história.", "Áudio emotivo em alta no momento, volume baixo para não competir com a narração."], salt);
  }
  if (tone === "provocativo" || tone === "direto") {
    return pick(["Beat seco e marcado, cortes no tempo da batida.", "Áudio em alta com trend atual de ritmo acelerado."], salt);
  }
  return pick(["Trilha leve de fundo, sem letra, para não competir com a fala.", "Áudio institucional/corporativo suave em volume baixo."], salt);
}

function recordingTips(style: string): string[] {
  const common = [
    "Grave na vertical (9:16) com boa luz natural de frente para o rosto.",
    "Use microfone de lapela ou aproxime-se do microfone do celular.",
    "Corte os silêncios na edição para manter o ritmo do vídeo.",
  ];
  const styleSpecific: Record<string, string[]> = {
    "Falando para a câmera": ["Mantenha contato visual com a lente, não com a tela.", "Use legendas automáticas para reter quem assiste sem som."],
    Storytelling: ["Grave em diferentes ambientes para marcar as mudanças de cena.", "Use música que acompanhe a emoção da história."],
    Tutorial: ["Grave close-ups do processo sendo feito na prática.", "Numere os passos na tela para facilitar o acompanhamento."],
  };
  return [...(styleSpecific[style] ?? []), ...common].slice(0, 4);
}

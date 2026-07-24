import { capitalize, cleanTheme, pick } from "./helpers";

interface HookContext {
  theme: string;
  audience?: string;
  tone: string;
  objective: string;
  painPoint?: string;
  desire?: string;
  salt: number;
}

export function buildHook(ctx: HookContext): string {
  const theme = cleanTheme(ctx.theme);
  const audience = ctx.audience?.trim();
  const pain = ctx.painPoint?.trim();
  const desire = ctx.desire?.trim();

  const templates: string[] = [
    `Se você ${audience ? `é ${audience} e` : ""} ainda trava na hora de ${theme}, para tudo e assiste isso.`,
    `Ninguém te contou isso sobre ${theme} — e é exatamente por isso que você ainda não vê resultado.`,
    `${capitalize(theme)} não é sobre esforço. É sobre fazer a coisa certa na ordem certa. Eu explico.`,
    pain ? `Cansado de ${pain.toLowerCase()}? Isso aqui muda o jogo.` : `${capitalize(theme)}: o que quase todo mundo faz errado.`,
    desire ? `Se o seu objetivo é ${desire.toLowerCase()}, esse conteúdo é para você.` : `Guarda esse conteúdo antes que ele suma do seu feed.`,
    `3 coisas que eu queria ter entendido sobre ${theme} antes de perder tempo.`,
    `Isso vai contra tudo que falam sobre ${theme} — e é por isso que funciona.`,
    `Se você trabalha com ${audience ?? "isso"}, essa informação vale mais que qualquer curso.`,
  ];

  const objectiveSpecific: Record<string, string[]> = {
    venda: [`Você não precisa de mais seguidores para vender. Precisa disso.`, `Isso aqui é o motivo pelo qual seu produto não está vendendo.`],
    objecoes: [`"Isso não funciona para mim" — sim, funciona. Deixa eu te mostrar.`, `A desculpa que está te impedindo de começar não é verdade.`],
    autoridade: [`Depois de anos trabalhando com ${theme}, aprendi isso na prática.`, `Poucas pessoas entendem ${theme} do jeito que eu vou te mostrar agora.`],
    historia: [`Isso quase deu errado — e a virada mudou tudo.`, `Uma história rápida sobre ${theme} que talvez mude sua forma de pensar.`],
  };

  const pool = [...templates, ...(objectiveSpecific[ctx.objective] ?? [])];
  return pick(pool, ctx.salt);
}

export function buildCta(ctx: { objective: string; cta?: string; brandCta?: string; tone: string; salt: number }): string {
  if (ctx.cta && ctx.cta.trim().length > 0) return ctx.cta.trim();
  if (ctx.brandCta && ctx.brandCta.trim().length > 0) return ctx.brandCta.trim();

  const map: Record<string, string[]> = {
    venda: ["Manda um DM com a palavra 'QUERO' e eu te mostro como garantir o seu.", "Link na bio para garantir o seu agora."],
    leads: ["Comenta 'EU QUERO' que eu te envio todos os detalhes no direct.", "Preenche o formulário no link da bio e fala com a gente."],
    seguidores: ["Segue para não perder os próximos conteúdos como esse.", "Ativa o sininho e me segue para mais conteúdos assim."],
    engajamento: ["Comenta aqui embaixo o que você achou.", "Manda esse conteúdo para quem precisa ver isso hoje."],
    autoridade: ["Salva esse conteúdo para consultar depois.", "Compartilha com alguém que precisa saber disso."],
    objecoes: ["Manda um direct e tira sua dúvida agora mesmo.", "Comenta sua maior dúvida que eu respondo no próximo conteúdo."],
    produto: ["Clica no link da bio e conheça o produto completo.", "Chama no direct para saber como funciona."],
    servico: ["Agenda uma conversa comigo pelo link da bio.", "Manda mensagem e vamos entender seu caso."],
    educar: ["Salva esse conteúdo para não esquecer.", "Segue para receber mais conteúdos como esse toda semana."],
    historia: ["Comenta se você já passou por algo parecido.", "Compartilha se essa história te tocou de alguma forma."],
  };
  const pool = map[ctx.objective] ?? ["Salva esse conteúdo e me conta o que achou nos comentários."];
  return pick(pool, ctx.salt + 7);
}

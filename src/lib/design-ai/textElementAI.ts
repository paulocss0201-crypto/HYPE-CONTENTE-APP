import { shortenText, persuasiveText, professionalText, fixGrammar, strongerHeadline, fitToSpace } from "@/lib/ai/textTransforms";

export type TextAIAction =
  | "melhorar-titulo"
  | "encurtar"
  | "persuasivo"
  | "profissional"
  | "gramatica"
  | "nova-versao"
  | "adaptar-espaco"
  | "headline-forte";

export function applyTextAIAction(text: string, action: TextAIAction, maxChars = 80): string {
  switch (action) {
    case "melhorar-titulo":
      return strongerHeadline(text);
    case "encurtar":
      return shortenText(text);
    case "persuasivo":
      return persuasiveText(text);
    case "profissional":
      return professionalText(text);
    case "gramatica":
      return fixGrammar(text);
    case "nova-versao":
      return persuasiveText(shortenText(text));
    case "adaptar-espaco":
      return fitToSpace(text, maxChars);
    case "headline-forte":
      return strongerHeadline(text);
    default:
      return text;
  }
}

export const TEXT_AI_ACTION_LABEL: Record<TextAIAction, string> = {
  "melhorar-titulo": "Melhorar título",
  encurtar: "Encurtar texto",
  persuasivo: "Deixar mais persuasivo",
  profissional: "Deixar mais profissional",
  gramatica: "Corrigir gramática",
  "nova-versao": "Criar outra versão",
  "adaptar-espaco": "Adaptar ao espaço disponível",
  "headline-forte": "Criar uma headline mais forte",
};

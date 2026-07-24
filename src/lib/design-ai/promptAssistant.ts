import { pick } from "@/lib/ai/helpers";

export interface ExpandedPromptParts {
  personagem: string;
  ambiente: string;
  iluminacao: string;
  composicao: string;
  enquadramento: string;
  expressao: string;
  camera: string;
  lente: string;
  texturas: string;
  cores: string;
  estilo: string;
  qualidade: string;
}

export function expandVisualPrompt(simpleDescription: string, salt: number): ExpandedPromptParts {
  const desc = simpleDescription.trim() || "uma cena profissional";

  return {
    personagem: `Elemento principal: ${desc}, com postura natural e confiante`,
    ambiente: pick(["ambiente interno moderno e clean", "cenário urbano contemporâneo", "estúdio minimalista com fundo neutro", "espaço amplo com luz controlada"], salt),
    iluminacao: pick(["luz suave lateral com leve contraste", "luz de estúdio difusa e uniforme", "luz natural entrando de uma janela lateral", "iluminação cinematográfica com sombras suaves"], salt + 1),
    composicao: pick(["regra dos terços, foco no elemento principal", "composição centralizada com espaço negativo generoso", "profundidade de campo rasa destacando o primeiro plano"], salt + 2),
    enquadramento: pick(["plano médio", "close-up", "plano aberto com contexto visível"], salt + 3),
    expressao: pick(["expressão confiante e natural", "expressão focada e serena", "expressão acolhedora e autêntica"], salt + 4),
    camera: pick(["câmera full-frame", "sensor profissional de alta resolução", "câmera mirrorless premium"], salt + 5),
    lente: pick(["lente 50mm f/1.8", "lente 85mm f/1.4", "lente grande angular 35mm"], salt + 6),
    texturas: pick(["texturas naturais e realistas", "superfícies com leve grão fotográfico", "detalhes nítidos e materiais autênticos"], salt + 7),
    cores: pick(["paleta neutra com contraste preto e branco", "tons quentes e dourados sutis", "paleta fria com destaques em cinza-claro"], salt + 8),
    estilo: pick(["estilo editorial premium", "estilo publicitário profissional", "estilo cinematográfico contemporâneo"], salt + 9),
    qualidade: "altíssima qualidade, ultrarrealista, 8k, extremamente detalhado",
  };
}

export function formatExpandedPrompt(parts: ExpandedPromptParts): string {
  return [
    parts.personagem,
    parts.ambiente,
    parts.iluminacao,
    parts.composicao,
    parts.enquadramento,
    parts.expressao,
    parts.camera,
    parts.lente,
    parts.texturas,
    parts.cores,
    parts.estilo,
    parts.qualidade,
  ].join(", ");
}

export type PromptRefineAction = "melhorar" | "realista" | "cinematografico" | "premium" | "adaptar_marca" | "variacao";

export function refinePromptText(prompt: string, action: PromptRefineAction, brandName?: string, salt = 0): string {
  switch (action) {
    case "melhorar":
      return `${prompt}, composição refinada, iluminação aprimorada, mais nitidez e profundidade`;
    case "realista":
      return `${prompt}, extremamente realista, textura de pele e materiais fiéis, sem aparência artificial`;
    case "cinematografico":
      return `${prompt}, tratamento de cor cinematográfico, contraste dramático, grão de filme sutil, proporção widescreen`;
    case "premium":
      return `${prompt}, acabamento premium, sensação exclusiva e sofisticada, iluminação impecável`;
    case "adaptar_marca":
      return `${prompt}, alinhado à identidade visual de ${brandName || "a marca"}, cores e estilo consistentes com o posicionamento premium`;
    case "variacao":
      return `${prompt}, variação ${Math.floor(salt % 100)} de composição e ângulo`;
    default:
      return prompt;
  }
}

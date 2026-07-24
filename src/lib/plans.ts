export const PLAN_LABEL: Record<string, string> = {
  gratuito: "Gratuito",
  pro: "Pro",
  premium: "Premium",
};

export interface PlanFeature {
  text: string;
}

export interface Plan {
  key: "gratuito" | "pro" | "premium";
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlight?: boolean;
  cta: string;
}

export const PLANS: Plan[] = [
  {
    key: "gratuito",
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Para testar a plataforma e criar seus primeiros conteúdos.",
    features: [
      "5 conteúdos gerados por mês",
      "Acesso aos geradores básicos",
      "Histórico limitado a 7 dias",
      "1 marca cadastrada",
    ],
    cta: "Começar grátis",
  },
  {
    key: "pro",
    name: "Pro",
    price: "R$ 97",
    period: "/mês",
    description: "Para criadores e profissionais que publicam com frequência.",
    features: [
      "100 conteúdos gerados por mês",
      "Calendário editorial com IA",
      "Perfil completo da marca",
      "Transformação entre formatos",
      "Histórico de versões completo",
      "Exportação em texto e documento",
      "Suporte prioritário",
    ],
    highlight: true,
    cta: "Assinar Pro",
  },
  {
    key: "premium",
    name: "Premium",
    price: "R$ 197",
    period: "/mês",
    description: "Para agências e negócios com múltiplas marcas.",
    features: [
      "Conteúdos ilimitados",
      "Todas as funcionalidades do Pro",
      "Até 5 marcas cadastradas",
      "Planejamento estratégico avançado",
      "Recursos avançados de IA",
      "Suporte dedicado",
    ],
    cta: "Assinar Premium",
  },
];

export type ContentFormat = "reels" | "carousel" | "stories";

export type ObjectiveKey =
  | "educar"
  | "engajar"
  | "autoridade"
  | "seguidores"
  | "objecoes"
  | "leads"
  | "produto"
  | "servico"
  | "venda"
  | "historia";

export const OBJECTIVE_OPTIONS: { key: ObjectiveKey; label: string }[] = [
  { key: "educar", label: "Educar" },
  { key: "engajar", label: "Engajar" },
  { key: "autoridade", label: "Gerar autoridade" },
  { key: "seguidores", label: "Atrair seguidores" },
  { key: "objecoes", label: "Quebrar objeções" },
  { key: "leads", label: "Gerar leads" },
  { key: "produto", label: "Apresentar um produto" },
  { key: "servico", label: "Apresentar um serviço" },
  { key: "venda", label: "Realizar uma venda" },
  { key: "historia", label: "Contar uma história" },
];

export type ToneKey =
  | "profissional"
  | "educativo"
  | "persuasivo"
  | "inspirador"
  | "descontraido"
  | "provocativo"
  | "direto"
  | "elegante";

export const TONE_OPTIONS: { key: ToneKey; label: string }[] = [
  { key: "profissional", label: "Profissional" },
  { key: "educativo", label: "Educativo" },
  { key: "persuasivo", label: "Persuasivo" },
  { key: "inspirador", label: "Inspirador" },
  { key: "descontraido", label: "Descontraído" },
  { key: "provocativo", label: "Provocativo" },
  { key: "direto", label: "Direto" },
  { key: "elegante", label: "Elegante" },
];

export type MainGoalKey =
  | "seguidores"
  | "engajamento"
  | "autoridade"
  | "leads"
  | "vender_produtos"
  | "vender_servicos"
  | "divulgar_marca"
  | "comunidade";

export const MAIN_GOAL_OPTIONS: { key: MainGoalKey; label: string }[] = [
  { key: "seguidores", label: "Aumentar seguidores" },
  { key: "engajamento", label: "Gerar engajamento" },
  { key: "autoridade", label: "Construir autoridade" },
  { key: "leads", label: "Captar leads" },
  { key: "vender_produtos", label: "Vender produtos" },
  { key: "vender_servicos", label: "Vender serviços" },
  { key: "divulgar_marca", label: "Divulgar uma marca" },
  { key: "comunidade", label: "Criar uma comunidade" },
];

export interface BrandProfile {
  userName: string;
  brandName: string;
  segment: string;
  offer: string;
  audience: string;
  painPoints: string;
  desires: string;
  objections: string;
  differentiators: string;
  mainGoal: MainGoalKey | "";
  tone: ToneKey | "";
  frequency: string;
  wordsToUse: string;
  wordsToAvoid: string;
  website: string;
  instagram: string;
  mainCta: string;
  voiceSamples: string;
  description: string;
  onboardingComplete: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "gratuito" | "pro" | "premium";
}

export type ProjectStatus = "idea" | "producing" | "ready" | "scheduled" | "published";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "Ideia",
  producing: "Em produção",
  ready: "Pronto",
  scheduled: "Agendado",
  published: "Publicado",
};

export interface ReelScene {
  scene: number;
  visual: string;
  onScreenText: string;
  narration: string;
}

export interface ReelContent {
  title: string;
  objective: string;
  hook: string;
  scenes: ReelScene[];
  narrationFull: string;
  visualSuggestions: string[];
  onScreenTextSuggestions: string[];
  cta: string;
  caption: string;
  hashtags: string[];
  audioSuggestion: string;
  recordingTips: string[];
}

export interface CarouselSlide {
  id: string;
  number: number;
  role: "capa" | "problema" | "desenvolvimento" | "transformacao" | "cta";
  title: string;
  body: string;
  visual: string;
  designNote: string;
}

export interface CarouselContent {
  slides: CarouselSlide[];
  caption: string;
  captionHook: string;
  cta: string;
  hashtags: string[];
  altTitle: string;
  altCover: string;
}

export interface StorySlide {
  id: string;
  number: number;
  stage: "gancho" | "identificacao" | "desenvolvimento" | "interacao" | "solucao" | "cta";
  objective: string;
  mainText: string;
  supportText: string;
  visual: string;
  background: string;
  interactive: string;
  cta: string;
}

export interface StoriesContent {
  stories: StorySlide[];
}

export type GeneratedContent =
  | { format: "reels"; data: ReelContent }
  | { format: "carousel"; data: CarouselContent }
  | { format: "stories"; data: StoriesContent };

export interface ContentVersion {
  id: string;
  label: string;
  createdAt: string;
  content: GeneratedContent;
}

export interface Project {
  id: string;
  title: string;
  format: ContentFormat;
  objective: ObjectiveKey | string;
  status: ProjectStatus;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  content: GeneratedContent;
  versions: ContentVersion[];
  scheduledDate?: string;
  scheduledTime?: string;
  calendarNotes?: string;
}

export interface CalendarEntry {
  id: string;
  projectId?: string;
  title: string;
  format: ContentFormat;
  date: string; // yyyy-MM-dd
  time?: string;
  status: ProjectStatus;
  notes?: string;
}

export interface GenerationRequest {
  format: ContentFormat;
  theme: string;
  offer?: string;
  objective: ObjectiveKey | string;
  audience?: string;
  tone: ToneKey | string;
  creativity: number;
  cta?: string;
  extra?: string;
  useBrandInfo: boolean;
  duration?: string;
  style?: string;
  slideCount?: number;
  storyCount?: number;
  interactionType?: string;
}

export interface IdeaCard {
  id: string;
  title: string;
  format: ContentFormat;
  objective: string;
  description: string;
  hook: string;
  category: string;
}

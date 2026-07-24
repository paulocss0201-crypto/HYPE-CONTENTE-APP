import {
  LayoutGrid,
  Sparkles,
  Clapperboard,
  Layers,
  CircleDot,
  Repeat,
  Lightbulb,
  CalendarDays,
  FolderKanban,
  Building2,
  Heart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Início", path: "/", icon: LayoutGrid },
  { key: "create", label: "Criar conteúdo", path: "/create", icon: Sparkles },
  { key: "reels", label: "Reels", path: "/create/reels", icon: Clapperboard },
  { key: "carousel", label: "Carrosséis", path: "/create/carousel", icon: Layers },
  { key: "stories", label: "Stories", path: "/create/stories", icon: CircleDot },
  { key: "repurpose", label: "Reaproveitar", path: "/repurpose", icon: Repeat },
  { key: "ideas", label: "Ideias", path: "/ideas", icon: Lightbulb },
  { key: "calendar", label: "Calendário", path: "/calendar", icon: CalendarDays },
  { key: "projects", label: "Meus projetos", path: "/projects", icon: FolderKanban },
  { key: "brand", label: "Marca e público", path: "/brand", icon: Building2 },
  { key: "favorites", label: "Favoritos", path: "/favorites", icon: Heart },
  { key: "settings", label: "Configurações", path: "/settings", icon: Settings },
];

export const MOBILE_PRIMARY_KEYS = ["home", "create", "calendar", "projects"];

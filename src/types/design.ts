export type DesignFormatKey =
  | "post-quadrado"
  | "post-vertical"
  | "story"
  | "capa-reels"
  | "carrossel-quadrado"
  | "carrossel-vertical";

export interface DesignFormatSpec {
  key: DesignFormatKey;
  label: string;
  width: number;
  height: number;
}

export const DESIGN_FORMATS: DesignFormatSpec[] = [
  { key: "post-quadrado", label: "Post quadrado (1080×1080)", width: 1080, height: 1080 },
  { key: "post-vertical", label: "Post vertical (1080×1350)", width: 1080, height: 1350 },
  { key: "story", label: "Story (1080×1920)", width: 1080, height: 1920 },
  { key: "capa-reels", label: "Capa de Reels (1080×1920)", width: 1080, height: 1920 },
  { key: "carrossel-quadrado", label: "Carrossel quadrado (1080×1080)", width: 1080, height: 1080 },
  { key: "carrossel-vertical", label: "Carrossel vertical (1080×1350)", width: 1080, height: 1350 },
];

export interface ElementShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface ElementBase {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  hidden: boolean;
  groupId?: string;
  name?: string;
}

export interface TextElement extends ElementBase {
  kind: "text";
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
  letterSpacing: number;
  lineHeight: number;
  uppercase: boolean;
  italic: boolean;
  underline: boolean;
  shadow: boolean;
  stroke: boolean;
  strokeColor: string;
  background: boolean;
  backgroundColor: string;
  gradient: boolean;
  gradientFrom: string;
  gradientTo: string;
  curved: boolean;
  curveAmount: number;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  temperature: number;
  noise: number;
}

export interface ImageElement extends ElementBase {
  kind: "image";
  src: string;
  filters: ImageFilters;
  flipX: boolean;
  flipY: boolean;
  cornerRadius: number;
  backgroundRemoved: boolean;
  duotoneEnabled: boolean;
  duotoneColor: string;
}

export type ShapeType = "rect" | "circle" | "line" | "arrow" | "frame";

export interface ShapeElement extends ElementBase {
  kind: "shape";
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  gradient: boolean;
  gradientFrom: string;
  gradientTo: string;
  gradientDirection: "vertical" | "horizontal";
}

export interface IconElement extends ElementBase {
  kind: "icon";
  icon: string;
  color: string;
}

export type DesignElement = TextElement | ImageElement | ShapeElement | IconElement;

export interface DesignSlide {
  id: string;
  background: string;
  backgroundGradientTo?: string;
  elements: DesignElement[];
}

// A template the user built by hand in the editor (drag/align/resize) and
// saved for reuse, as opposed to the built-in code-generated DesignTemplate
// entries in lib/design-ai/templates.ts.
export interface UserTemplate {
  id: string;
  name: string;
  format: DesignFormatKey;
  background: string;
  backgroundGradientTo?: string;
  elements: DesignElement[];
  thumbnail?: string;
  createdAt: string;
}

export interface DesignVersion {
  id: string;
  label: string;
  createdAt: string;
  slides: DesignSlide[];
}

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface DesignProject {
  id: string;
  name: string;
  format: DesignFormatKey;
  contentProjectId?: string;
  slides: DesignSlide[];
  versions: DesignVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandKit {
  logoPrimary?: string;
  logoSecondary?: string;
  symbol?: string;
  colors: string[];
  fonts: string[];
  images: string[];
  icons: string[];
  references: string[];
  rules: string;
}

export interface GeneratedImage {
  id: string;
  src: string;
  prompt: string;
  style: string;
  createdAt: string;
}

export const FONT_OPTIONS = ["Inter", "Manrope", "Playfair Display", "Space Grotesk", "DM Sans", "Bebas Neue"];

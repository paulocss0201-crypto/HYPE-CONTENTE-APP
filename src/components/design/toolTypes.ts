export type ToolKey = "templates" | "text" | "images" | "elements" | "shapes" | "icons" | "backgrounds" | "uploads" | "brand" | "ai" | "layers";

export interface ToolMeta {
  key: ToolKey;
  label: string;
}

export const TOOLS: ToolMeta[] = [
  { key: "templates", label: "Templates" },
  { key: "text", label: "Texto" },
  { key: "images", label: "Imagens" },
  { key: "elements", label: "Elementos" },
  { key: "shapes", label: "Formas" },
  { key: "icons", label: "Ícones" },
  { key: "backgrounds", label: "Fundos" },
  { key: "uploads", label: "Uploads" },
  { key: "brand", label: "Marca" },
  { key: "ai", label: "IA" },
  { key: "layers", label: "Camadas" },
];

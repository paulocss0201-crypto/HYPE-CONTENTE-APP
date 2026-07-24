export type ToolKey = "templates" | "text" | "images" | "elements" | "shapes" | "icons" | "backgrounds" | "uploads" | "brand" | "ai" | "layers";

export type EditMode = "simples" | "avancado" | "ia";

export const EDIT_MODES: { key: EditMode; label: string }[] = [
  { key: "simples", label: "Simples" },
  { key: "avancado", label: "Avançado" },
  { key: "ia", label: "IA" },
];

export type GridMode = "none" | "2" | "3" | "4" | "6" | "modular" | "editorial";

export const GRID_MODES: { key: GridMode; label: string }[] = [
  { key: "none", label: "Nenhuma" },
  { key: "2", label: "2 colunas" },
  { key: "3", label: "3 colunas" },
  { key: "4", label: "4 colunas" },
  { key: "6", label: "6 colunas" },
  { key: "modular", label: "Modular" },
  { key: "editorial", label: "Editorial" },
];

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

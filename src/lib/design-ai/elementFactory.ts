import { uid } from "@/lib/utils";
import type { DesignElement, DesignSlide, IconElement, ImageElement, ShapeElement, ShapeType, TextElement } from "@/types/design";

export function nextZIndex(slide: DesignSlide): number {
  return slide.elements.reduce((max, e) => Math.max(max, e.zIndex), 0) + 1;
}

export function makeTextElement(partial: Partial<TextElement> & { content: string }): TextElement {
  return {
    id: uid("el"),
    x: 100,
    y: 100,
    width: 600,
    height: 120,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    locked: false,
    hidden: false,
    kind: "text",
    fontFamily: "Inter",
    fontSize: 48,
    fontWeight: 700,
    color: "#ffffff",
    align: "left",
    letterSpacing: 0,
    lineHeight: 1.2,
    uppercase: false,
    italic: false,
    underline: false,
    shadow: false,
    stroke: false,
    strokeColor: "#000000",
    background: false,
    backgroundColor: "#000000",
    gradient: false,
    gradientFrom: "#ffffff",
    gradientTo: "#a3a3a3",
    curved: false,
    curveAmount: 0,
    ...partial,
  };
}

export function makeImageElement(partial: Partial<ImageElement> & { src: string }): ImageElement {
  return {
    id: uid("el"),
    x: 80,
    y: 80,
    width: 400,
    height: 400,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    locked: false,
    hidden: false,
    kind: "image",
    filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0, temperature: 0, noise: 0 },
    flipX: false,
    flipY: false,
    cornerRadius: 0,
    backgroundRemoved: false,
    duotoneEnabled: false,
    duotoneColor: "#ffffff",
    ...partial,
  };
}

export function makeShapeElement(shapeType: ShapeType, partial: Partial<ShapeElement> = {}): ShapeElement {
  return {
    id: uid("el"),
    x: 100,
    y: 100,
    width: 300,
    height: shapeType === "line" ? 4 : 300,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    locked: false,
    hidden: false,
    kind: "shape",
    shapeType,
    fill: "#242424",
    stroke: "#ffffff",
    strokeWidth: 0,
    cornerRadius: shapeType === "rect" ? 16 : 0,
    ...partial,
  };
}

export function makeIconElement(icon: string, partial: Partial<IconElement> = {}): IconElement {
  return {
    id: uid("el"),
    x: 100,
    y: 100,
    width: 80,
    height: 80,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    locked: false,
    hidden: false,
    kind: "icon",
    icon,
    color: "#ffffff",
    ...partial,
  };
}

export function emptySlide(background = "#0a0a0a"): DesignSlide {
  return { id: uid("slide"), background, elements: [] };
}

export function withZIndex(elements: DesignElement[]): DesignElement[] {
  return elements.map((e, i) => ({ ...e, zIndex: i + 1 }));
}

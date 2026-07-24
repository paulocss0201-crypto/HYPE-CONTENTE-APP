import type { DesignElement, DesignSlide } from "@/types/design";
import type { DesignFormatSpec } from "@/types/design";
import { makeTextElement, makeShapeElement, makeImageElement, nextZIndex } from "./elementFactory";
import type { DesignPalette } from "./palette";
import { rand } from "@/lib/ai/helpers";

export interface LayoutInput {
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: string;
  imageSrc?: string;
  palette: DesignPalette;
  format: DesignFormatSpec;
}

export type SlideRole = "capa" | "problema" | "desenvolvimento" | "transformacao" | "cta" | "generic";

type LayoutFn = (input: LayoutInput) => { background: string; backgroundGradientTo?: string; elements: DesignElement[] };

function pushEl(elements: DesignElement[], el: DesignElement, slideDummy: DesignSlide) {
  el.zIndex = nextZIndex(slideDummy);
  slideDummy.elements.push(el);
  elements.push(el);
}

function baseSlide(): DesignSlide {
  return { id: "tmp", background: "#000", elements: [] };
}

export const layoutBoldStatement: LayoutFn = ({ title, cta, palette, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  pushEl(
    elements,
    makeTextElement({
      content: title,
      x: w * 0.08,
      y: h * 0.32,
      width: w * 0.84,
      height: h * 0.36,
      fontSize: Math.round(w * 0.075),
      fontWeight: 800,
      color: palette.text,
      align: "left",
      lineHeight: 1.08,
    }),
    dummy
  );
  if (cta) {
    pushEl(
      elements,
      makeShapeElement("rect", { x: w * 0.08, y: h * 0.86, width: w * 0.5, height: h * 0.06, fill: palette.accent, cornerRadius: 999 }),
      dummy
    );
    pushEl(
      elements,
      makeTextElement({
        content: cta,
        x: w * 0.1,
        y: h * 0.868,
        width: w * 0.46,
        height: h * 0.045,
        fontSize: Math.round(w * 0.026),
        fontWeight: 700,
        color: palette.accent === "#ffffff" ? "#0a0a0a" : "#ffffff",
        align: "center",
      }),
      dummy
    );
  }
  return { background: palette.bg, backgroundGradientTo: palette.bgTo, elements };
};

export const layoutImageOverlay: LayoutFn = ({ title, cta, imageSrc, palette, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  if (imageSrc) {
    pushEl(elements, makeImageElement({ src: imageSrc, x: 0, y: 0, width: w, height: h, cornerRadius: 0 }), dummy);
  }
  pushEl(
    elements,
    makeShapeElement("rect", { x: 0, y: h * 0.55, width: w, height: h * 0.45, fill: "#000000", opacity: 0.55, cornerRadius: 0 }),
    dummy
  );
  pushEl(
    elements,
    makeTextElement({
      content: title,
      x: w * 0.08,
      y: h * 0.66,
      width: w * 0.84,
      height: h * 0.2,
      fontSize: Math.round(w * 0.062),
      fontWeight: 800,
      color: "#ffffff",
      lineHeight: 1.1,
    }),
    dummy
  );
  if (cta) {
    pushEl(
      elements,
      makeTextElement({
        content: cta,
        x: w * 0.08,
        y: h * 0.88,
        width: w * 0.84,
        height: h * 0.06,
        fontSize: Math.round(w * 0.03),
        fontWeight: 600,
        color: palette.accent,
      }),
      dummy
    );
  }
  return { background: "#0a0a0a", elements };
};

export const layoutSplit: LayoutFn = ({ eyebrow, title, body, palette, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  pushEl(elements, makeShapeElement("rect", { x: 0, y: 0, width: w, height: h * 0.5, fill: palette.bgTo ?? "#161616", cornerRadius: 0 }), dummy);
  if (eyebrow) {
    pushEl(
      elements,
      makeTextElement({ content: eyebrow.toUpperCase(), x: w * 0.08, y: h * 0.1, width: w * 0.6, height: h * 0.05, fontSize: Math.round(w * 0.022), fontWeight: 700, color: palette.accent, letterSpacing: 2 }),
      dummy
    );
  }
  pushEl(
    elements,
    makeTextElement({ content: title, x: w * 0.08, y: h * 0.17, width: w * 0.84, height: h * 0.28, fontSize: Math.round(w * 0.058), fontWeight: 800, color: palette.text, lineHeight: 1.15 }),
    dummy
  );
  if (body) {
    pushEl(
      elements,
      makeTextElement({ content: body, x: w * 0.08, y: h * 0.58, width: w * 0.84, height: h * 0.3, fontSize: Math.round(w * 0.032), fontWeight: 400, color: "#c9c9c9", lineHeight: 1.4 }),
      dummy
    );
  }
  return { background: "#0a0a0a", elements };
};

export const layoutQuoteCard: LayoutFn = ({ title, cta, palette, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  pushEl(elements, makeShapeElement("line", { x: w * 0.12, y: h * 0.28, width: w * 0.14, height: 6, fill: palette.accent }), dummy);
  pushEl(
    elements,
    makeTextElement({ content: title, x: w * 0.1, y: h * 0.34, width: w * 0.8, height: h * 0.36, fontSize: Math.round(w * 0.055), fontWeight: 700, color: palette.text, align: "left", lineHeight: 1.25 }),
    dummy
  );
  if (cta) {
    pushEl(
      elements,
      makeTextElement({ content: cta, x: w * 0.1, y: h * 0.82, width: w * 0.8, height: h * 0.06, fontSize: Math.round(w * 0.026), fontWeight: 600, color: palette.accent }),
      dummy
    );
  }
  return { background: palette.bg, backgroundGradientTo: palette.bgTo, elements };
};

export const layoutNumbered: LayoutFn = ({ eyebrow, title, body, palette, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  pushEl(elements, makeShapeElement("circle", { x: w * 0.08, y: h * 0.08, width: w * 0.16, height: w * 0.16, fill: "#161616", stroke: palette.accent, strokeWidth: 3 }), dummy);
  pushEl(
    elements,
    makeTextElement({ content: eyebrow ?? "01", x: w * 0.08, y: h * 0.1, width: w * 0.16, height: w * 0.12, fontSize: Math.round(w * 0.05), fontWeight: 800, color: palette.accent, align: "center" }),
    dummy
  );
  pushEl(
    elements,
    makeTextElement({ content: title, x: w * 0.08, y: h * 0.3, width: w * 0.84, height: h * 0.16, fontSize: Math.round(w * 0.048), fontWeight: 700, color: palette.text, lineHeight: 1.2 }),
    dummy
  );
  if (body) {
    pushEl(
      elements,
      makeTextElement({ content: body, x: w * 0.08, y: h * 0.48, width: w * 0.84, height: h * 0.3, fontSize: Math.round(w * 0.03), fontWeight: 400, color: "#c9c9c9", lineHeight: 1.4 }),
      dummy
    );
  }
  return { background: "#0a0a0a", elements };
};

export const layoutMinimalFrame: LayoutFn = ({ title, cta, palette, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  pushEl(
    elements,
    makeShapeElement("rect", { x: w * 0.05, y: h * 0.05, width: w * 0.9, height: h * 0.9, fill: "transparent", stroke: palette.accent, strokeWidth: 2, cornerRadius: 0 }),
    dummy
  );
  pushEl(
    elements,
    makeTextElement({ content: title, x: w * 0.14, y: h * 0.4, width: w * 0.72, height: h * 0.24, fontSize: Math.round(w * 0.052), fontWeight: 700, color: palette.text, align: "center", lineHeight: 1.2 }),
    dummy
  );
  if (cta) {
    pushEl(
      elements,
      makeTextElement({ content: cta, x: w * 0.14, y: h * 0.86, width: w * 0.72, height: h * 0.05, fontSize: Math.round(w * 0.024), fontWeight: 600, color: palette.accent, align: "center", letterSpacing: 1.5 }),
      dummy
    );
  }
  return { background: palette.bg, backgroundGradientTo: palette.bgTo, elements };
};

const ROLE_LAYOUTS: Record<SlideRole, LayoutFn[]> = {
  capa: [layoutBoldStatement, layoutImageOverlay, layoutMinimalFrame],
  problema: [layoutSplit, layoutQuoteCard],
  desenvolvimento: [layoutNumbered, layoutSplit],
  transformacao: [layoutImageOverlay, layoutQuoteCard],
  cta: [layoutBoldStatement, layoutMinimalFrame],
  generic: [layoutBoldStatement, layoutSplit, layoutQuoteCard, layoutNumbered],
};

export function buildSlide(role: SlideRole, input: LayoutInput, salt: number): DesignSlide {
  const pool = ROLE_LAYOUTS[role];
  const layoutFn = pool[Math.floor(rand(salt) * pool.length) % pool.length];
  const { background, backgroundGradientTo, elements } = layoutFn(input);
  return { id: "slide", background, backgroundGradientTo, elements };
}

import type { DesignElement, DesignSlide } from "@/types/design";
import type { DesignFormatSpec } from "@/types/design";
import { makeTextElement, makeShapeElement, makeImageElement, nextZIndex } from "./elementFactory";
import type { DesignPalette } from "./palette";
import type { FontPairing } from "./typography";
import { MARGIN } from "./layoutConstants";
import { fitFontSize } from "./textFit";
import { bestContrastColor } from "./contrast";
import { rand } from "@/lib/ai/helpers";

export interface LayoutInput {
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: string;
  imageSrc?: string;
  palette: DesignPalette;
  fontPairing: FontPairing;
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

// Content margin shared by every layout so slides line up on the same edges
// regardless of which composition is chosen.
const M = MARGIN;
const CONTENT_W = (w: number) => w * (1 - 2 * M);

export const layoutBoldStatement: LayoutFn = ({ title, cta, palette, fontPairing, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  const titleWidth = CONTENT_W(w);
  const titleHeight = h * 0.36;
  const titleFontSize = fitFontSize({ content: title, fontFamily: fontPairing.title, fontWeight: 800, width: titleWidth, height: titleHeight, lineHeight: 1.08, maxFontSize: Math.round(w * 0.075), minFontSize: 32 });
  pushEl(
    elements,
    makeTextElement({
      content: title,
      x: w * M,
      y: h * 0.32,
      width: titleWidth,
      height: titleHeight,
      fontFamily: fontPairing.title,
      fontSize: titleFontSize,
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
      makeShapeElement("rect", { x: w * M, y: h * 0.86, width: w * 0.5, height: h * 0.06, fill: palette.accent, cornerRadius: 999 }),
      dummy
    );
    pushEl(
      elements,
      makeTextElement({
        content: cta,
        x: w * (M + 0.02),
        y: h * 0.868,
        width: w * 0.46,
        height: h * 0.045,
        fontFamily: fontPairing.body,
        fontSize: Math.round(w * 0.026),
        fontWeight: 700,
        color: bestContrastColor(palette.accent),
        align: "center",
      }),
      dummy
    );
  }
  return { background: palette.bg, backgroundGradientTo: palette.bgTo, elements };
};

export const layoutImageOverlay: LayoutFn = ({ title, cta, imageSrc, palette, fontPairing, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  if (imageSrc) {
    pushEl(elements, makeImageElement({ src: imageSrc, x: 0, y: 0, width: w, height: h, cornerRadius: 0 }), dummy);
  }
  pushEl(
    elements,
    makeShapeElement("rect", {
      x: 0,
      y: h * 0.42,
      width: w,
      height: h * 0.58,
      cornerRadius: 0,
      gradient: true,
      gradientFrom: "rgba(0,0,0,0)",
      gradientTo: "rgba(0,0,0,0.82)",
      gradientDirection: "vertical",
    }),
    dummy
  );
  const titleWidth = CONTENT_W(w);
  const titleHeight = h * 0.2;
  const titleFontSize = fitFontSize({ content: title, fontFamily: fontPairing.title, fontWeight: 800, width: titleWidth, height: titleHeight, lineHeight: 1.1, maxFontSize: Math.round(w * 0.062), minFontSize: 28 });
  pushEl(
    elements,
    makeTextElement({
      content: title,
      x: w * M,
      y: h * 0.66,
      width: titleWidth,
      height: titleHeight,
      fontFamily: fontPairing.title,
      fontSize: titleFontSize,
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
        x: w * M,
        y: h * 0.88,
        width: titleWidth,
        height: h * 0.06,
        fontFamily: fontPairing.body,
        fontSize: Math.round(w * 0.03),
        fontWeight: 600,
        color: palette.accent,
      }),
      dummy
    );
  }
  return { background: palette.bg, elements };
};

export const layoutSplit: LayoutFn = ({ eyebrow, title, body, palette, fontPairing, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  const contentWidth = CONTENT_W(w);
  pushEl(elements, makeShapeElement("rect", { x: 0, y: 0, width: w, height: h * 0.5, fill: palette.bgTo ?? "#161616", cornerRadius: 0 }), dummy);
  if (eyebrow) {
    pushEl(
      elements,
      makeTextElement({ content: eyebrow.toUpperCase(), x: w * M, y: h * 0.1, width: w * 0.6, height: h * 0.05, fontFamily: fontPairing.body, fontSize: Math.round(w * 0.022), fontWeight: 700, color: palette.accent, letterSpacing: 2 }),
      dummy
    );
  }
  const titleHeight = h * 0.28;
  const titleFontSize = fitFontSize({ content: title, fontFamily: fontPairing.title, fontWeight: 800, width: contentWidth, height: titleHeight, lineHeight: 1.15, maxFontSize: Math.round(w * 0.058), minFontSize: 30 });
  pushEl(
    elements,
    makeTextElement({ content: title, x: w * M, y: h * 0.17, width: contentWidth, height: titleHeight, fontFamily: fontPairing.title, fontSize: titleFontSize, fontWeight: 800, color: palette.text, lineHeight: 1.15 }),
    dummy
  );
  if (body) {
    const bodyHeight = h * 0.3;
    const bodyFontSize = fitFontSize({ content: body, fontFamily: fontPairing.body, fontWeight: 400, width: contentWidth, height: bodyHeight, lineHeight: 1.4, maxFontSize: Math.round(w * 0.032), minFontSize: 20 });
    pushEl(
      elements,
      makeTextElement({ content: body, x: w * M, y: h * 0.58, width: contentWidth, height: bodyHeight, fontFamily: fontPairing.body, fontSize: bodyFontSize, fontWeight: 400, color: palette.text, opacity: 0.72, lineHeight: 1.4 }),
      dummy
    );
  }
  return { background: palette.bg, backgroundGradientTo: palette.bgTo, elements };
};

export const layoutQuoteCard: LayoutFn = ({ title, cta, palette, fontPairing, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  const contentWidth = CONTENT_W(w);
  pushEl(elements, makeShapeElement("line", { x: w * M, y: h * 0.28, width: w * 0.14, height: 6, fill: palette.accent }), dummy);
  const titleHeight = h * 0.36;
  const titleFontSize = fitFontSize({ content: title, fontFamily: fontPairing.title, fontWeight: 700, width: contentWidth, height: titleHeight, lineHeight: 1.25, maxFontSize: Math.round(w * 0.055), minFontSize: 26 });
  pushEl(
    elements,
    makeTextElement({ content: title, x: w * M, y: h * 0.34, width: contentWidth, height: titleHeight, fontFamily: fontPairing.title, fontSize: titleFontSize, fontWeight: 700, color: palette.text, align: "left", lineHeight: 1.25 }),
    dummy
  );
  if (cta) {
    pushEl(
      elements,
      makeTextElement({ content: cta, x: w * M, y: h * 0.82, width: contentWidth, height: h * 0.06, fontFamily: fontPairing.body, fontSize: Math.round(w * 0.026), fontWeight: 600, color: palette.accent }),
      dummy
    );
  }
  return { background: palette.bg, backgroundGradientTo: palette.bgTo, elements };
};

export const layoutNumbered: LayoutFn = ({ eyebrow, title, body, palette, fontPairing, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  const contentWidth = CONTENT_W(w);
  pushEl(elements, makeShapeElement("circle", { x: w * M, y: h * 0.08, width: w * 0.16, height: w * 0.16, fill: "#161616", stroke: palette.accent, strokeWidth: 3 }), dummy);
  pushEl(
    elements,
    makeTextElement({ content: eyebrow ?? "01", x: w * M, y: h * 0.1, width: w * 0.16, height: w * 0.12, fontFamily: fontPairing.title, fontSize: Math.round(w * 0.05), fontWeight: 800, color: palette.accent, align: "center" }),
    dummy
  );
  const titleHeight = h * 0.16;
  const titleFontSize = fitFontSize({ content: title, fontFamily: fontPairing.title, fontWeight: 700, width: contentWidth, height: titleHeight, lineHeight: 1.2, maxFontSize: Math.round(w * 0.048), minFontSize: 26 });
  pushEl(
    elements,
    makeTextElement({ content: title, x: w * M, y: h * 0.3, width: contentWidth, height: titleHeight, fontFamily: fontPairing.title, fontSize: titleFontSize, fontWeight: 700, color: palette.text, lineHeight: 1.2 }),
    dummy
  );
  if (body) {
    const bodyHeight = h * 0.3;
    const bodyFontSize = fitFontSize({ content: body, fontFamily: fontPairing.body, fontWeight: 400, width: contentWidth, height: bodyHeight, lineHeight: 1.4, maxFontSize: Math.round(w * 0.03), minFontSize: 18 });
    pushEl(
      elements,
      makeTextElement({ content: body, x: w * M, y: h * 0.48, width: contentWidth, height: bodyHeight, fontFamily: fontPairing.body, fontSize: bodyFontSize, fontWeight: 400, color: palette.text, opacity: 0.72, lineHeight: 1.4 }),
      dummy
    );
  }
  return { background: palette.bg, backgroundGradientTo: palette.bgTo, elements };
};

export const layoutMinimalFrame: LayoutFn = ({ title, cta, palette, fontPairing, format }) => {
  const dummy = baseSlide();
  const elements: DesignElement[] = [];
  const w = format.width;
  const h = format.height;
  const frameInset = M * 0.6;
  const textInset = M * 1.75;
  const contentWidth = w * (1 - 2 * textInset);
  pushEl(
    elements,
    makeShapeElement("rect", { x: w * frameInset, y: h * frameInset, width: w * (1 - 2 * frameInset), height: h * (1 - 2 * frameInset), fill: "transparent", stroke: palette.accent, strokeWidth: 2, cornerRadius: 0 }),
    dummy
  );
  const titleHeight = h * 0.24;
  const titleFontSize = fitFontSize({ content: title, fontFamily: fontPairing.title, fontWeight: 700, width: contentWidth, height: titleHeight, lineHeight: 1.2, maxFontSize: Math.round(w * 0.052), minFontSize: 26 });
  pushEl(
    elements,
    makeTextElement({ content: title, x: w * textInset, y: h * 0.4, width: contentWidth, height: titleHeight, fontFamily: fontPairing.title, fontSize: titleFontSize, fontWeight: 700, color: palette.text, align: "center", lineHeight: 1.2 }),
    dummy
  );
  if (cta) {
    pushEl(
      elements,
      makeTextElement({ content: cta, x: w * textInset, y: h * 0.86, width: contentWidth, height: h * 0.05, fontFamily: fontPairing.body, fontSize: Math.round(w * 0.024), fontWeight: 600, color: palette.accent, align: "center", letterSpacing: 1.5 }),
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

// `salt` picks which layout in the role's pool to use. Callers that want
// every slide of a given role to share the same composition (e.g. a
// carousel) should derive a salt that is stable per-role rather than
// per-slide — see generateDesignFromContent's use of `roleLayoutSalt`.
export function buildSlide(role: SlideRole, input: LayoutInput, salt: number): DesignSlide {
  const pool = ROLE_LAYOUTS[role];
  const layoutFn = pool[Math.floor(rand(salt) * pool.length) % pool.length];
  const { background, backgroundGradientTo, elements } = layoutFn(input);
  return { id: "slide", background, backgroundGradientTo, elements };
}

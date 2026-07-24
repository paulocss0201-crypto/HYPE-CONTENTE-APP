export interface ImageGenParams {
  description: string;
  style: string;
  format: string;
  lighting: string;
  framing: string;
  scenario: string;
  cameraAngle: string;
  realism: number;
  avoid?: string;
}

const LIGHTING_GRADIENTS: Record<string, [string, string, string]> = {
  "Luz de estúdio": ["#3a3a3a", "#1c1c1c", "#0a0a0a"],
  "Luz natural": ["#d9c7a3", "#8a6f4d", "#241c12"],
  "Luz cinematográfica": ["#0f4c5c", "#c96a30", "#0a0a0a"],
  "Luz suave": ["#c9b8c9", "#6b5b73", "#161616"],
  "Alto contraste": ["#ffffff", "#1a1a1a", "#000000"],
  Neon: ["#d946ef", "#22d3ee", "#0a0a0a"],
  "Ambiente escuro": ["#1c1c1c", "#0a0a0a", "#000000"],
  "Golden hour": ["#f6ad55", "#c05621", "#1a0f08"],
};

const STYLE_ACCENTS: Record<string, string> = {
  Futurista: "grid",
  Minimalista: "clean",
  Editorial: "grain",
  Corporativo: "grain",
  "Arte 3D": "blobs",
  Ilustração: "blobs",
  Cinematográfico: "letterbox",
  "Produto em estúdio": "spotlight",
  Publicitário: "spotlight",
  Lifestyle: "bokeh",
  Ultrarrrealista: "grain",
  "Fotografia profissional": "grain",
};

function hashSeed(text: string, index: number): number {
  let h = 2166136261 ^ index * 7919;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  }
  return Math.abs(h);
}

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function buildImageDataUri(params: ImageGenParams, index: number, width = 800, height = 800): string {
  const seed = hashSeed(`${params.description}|${params.style}|${params.lighting}|${params.scenario}`, index);
  const rand = seededRandom(seed);
  const [c1, c2, c3] = LIGHTING_GRADIENTS[params.lighting] ?? LIGHTING_GRADIENTS["Luz de estúdio"];
  const accent = STYLE_ACCENTS[params.style] ?? "bokeh";

  const focalScale = params.framing?.toLowerCase().includes("close") ? 1.35 : params.framing?.toLowerCase().includes("aberto") ? 0.7 : 1;
  const cx = width * (0.35 + rand() * 0.3);
  const cy = height * (0.35 + rand() * 0.3);

  let overlay = "";
  if (accent === "grid") {
    const lines: string[] = [];
    const step = width / 10;
    for (let i = 1; i < 10; i++) {
      lines.push(`<line x1="${i * step}" y1="0" x2="${i * step}" y2="${height}" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>`);
      lines.push(`<line x1="0" y1="${i * step}" x2="${width}" y2="${i * step}" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>`);
    }
    overlay = lines.join("");
  } else if (accent === "blobs") {
    const blobs: string[] = [];
    for (let i = 0; i < 4; i++) {
      const bx = width * rand();
      const by = height * rand();
      const br = width * (0.12 + rand() * 0.18);
      blobs.push(`<circle cx="${bx}" cy="${by}" r="${br}" fill="${i % 2 === 0 ? c2 : c3}" fill-opacity="0.35" />`);
    }
    overlay = blobs.join("");
  } else if (accent === "letterbox") {
    overlay = `<rect x="0" y="0" width="${width}" height="${height * 0.12}" fill="#000000"/><rect x="0" y="${height * 0.88}" width="${width}" height="${height * 0.12}" fill="#000000"/>
      <circle cx="${cx}" cy="${cy}" r="${width * 0.05}" fill="#ffffff" fill-opacity="0.5" />`;
  } else if (accent === "spotlight") {
    overlay = `<ellipse cx="${width / 2}" cy="${height * 0.68}" rx="${width * 0.32}" ry="${height * 0.06}" fill="#000000" fill-opacity="0.4" />`;
  } else if (accent === "grain") {
    const dots: string[] = [];
    const count = Math.round(40 + params.realism * 1.2);
    for (let i = 0; i < count; i++) {
      dots.push(`<circle cx="${width * rand()}" cy="${height * rand()}" r="${0.6 + rand()}" fill="#ffffff" fill-opacity="${0.03 + rand() * 0.05}" />`);
    }
    overlay = dots.join("");
  } else {
    const bokeh: string[] = [];
    for (let i = 0; i < 6; i++) {
      bokeh.push(`<circle cx="${width * rand()}" cy="${height * rand()}" r="${width * (0.03 + rand() * 0.05)}" fill="#ffffff" fill-opacity="${0.08 + rand() * 0.1}" />`);
    }
    overlay = bokeh.join("");
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="g${seed}" cx="${cx / width}" cy="${cy / height}" r="${0.9 * focalScale}">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="55%" stop-color="${c2}" />
        <stop offset="100%" stop-color="${c3}" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g${seed})" />
    ${overlay}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateImages(params: ImageGenParams, count: number, width = 800, height = 800): string[] {
  return Array.from({ length: count }, (_, i) => buildImageDataUri(params, i, width, height));
}

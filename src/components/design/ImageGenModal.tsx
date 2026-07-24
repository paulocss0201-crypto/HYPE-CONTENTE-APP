import { useState } from "react";
import { Modal, Button, Textarea, Select, Input, Slider } from "@/components/ui";
import { generateImages } from "@/lib/design-ai";
import type { ImageGenParams } from "@/lib/design-ai";
import { useDesignStore } from "@/store/designStore";
import { useUiStore } from "@/store/uiStore";
import { Sparkles, Plus, RefreshCw, Pencil, Wand2, Scissors, Maximize2, Save, Trash2 } from "lucide-react";

const STYLES = [
  "Ultrarrrealista",
  "Fotografia profissional",
  "Editorial",
  "Corporativo",
  "Publicitário",
  "Cinematográfico",
  "Produto em estúdio",
  "Lifestyle",
  "Futurista",
  "Minimalista",
  "Ilustração",
  "Arte 3D",
];

const FORMATS = ["Quadrado", "Vertical", "Story", "Horizontal", "Retrato", "Paisagem", "Personalizado"];
const FORMAT_DIMS: Record<string, [number, number]> = {
  Quadrado: [800, 800],
  Vertical: [800, 1000],
  Story: [800, 1422],
  Horizontal: [1200, 800],
  Retrato: [800, 1100],
  Paisagem: [1200, 750],
  Personalizado: [900, 900],
};

const LIGHTING = ["Luz de estúdio", "Luz natural", "Luz cinematográfica", "Luz suave", "Alto contraste", "Neon", "Ambiente escuro", "Golden hour"];

export function ImageGenModal({ open, onClose, onAddToDesign }: { open: boolean; onClose: () => void; onAddToDesign: (src: string) => void }) {
  const addGeneratedImage = useDesignStore((s) => s.addGeneratedImage);
  const pushToast = useUiStore((s) => s.pushToast);

  const [description, setDescription] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [format, setFormat] = useState(FORMATS[0]);
  const [lighting, setLighting] = useState(LIGHTING[0]);
  const [framing, setFraming] = useState("Plano médio");
  const [scenario, setScenario] = useState("");
  const [cameraAngle, setCameraAngle] = useState("Frontal");
  const [realism, setRealism] = useState(80);
  const [count, setCount] = useState("4");
  const [avoid, setAvoid] = useState("");
  const [generating, setGenerating] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);

  function buildParams(): ImageGenParams {
    return { description, style, format, lighting, framing, scenario, cameraAngle, realism, avoid };
  }

  async function handleGenerate() {
    if (!description.trim()) {
      pushToast("Descreva a imagem que você quer gerar.", "error");
      return;
    }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1400));
    const [w, h] = FORMAT_DIMS[format] ?? [800, 800];
    const images = generateImages(buildParams(), Number(count), w, h);
    setGallery(images);
    setGenerating(false);
  }

  function handleVariation(src: string) {
    const [w, h] = FORMAT_DIMS[format] ?? [800, 800];
    const [variant] = generateImages({ ...buildParams(), description: `${description} variação` }, 1, w, h);
    setGallery((g) => [variant, ...g.filter((s) => s !== src)]);
  }

  function handleSaveToLibrary(src: string) {
    addGeneratedImage({ src, prompt: description, style });
    pushToast("Imagem salva na biblioteca", "success");
  }

  function handleAdd(src: string) {
    onAddToDesign(src);
    pushToast("Imagem adicionada ao design", "success");
  }

  return (
    <Modal open={open} onClose={onClose} title="Gerar imagem com IA" size="lg">
      <div className="flex flex-col gap-4">
        <Textarea label="Descrição da imagem" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: um empresário confiante usando inteligência artificial em um escritório moderno" />

        <div className="grid sm:grid-cols-2 gap-3">
          <Select label="Estilo" value={style} onChange={(e) => setStyle(e.target.value)}>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select label="Formato" value={format} onChange={(e) => setFormat(e.target.value)}>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Select label="Iluminação" value={lighting} onChange={(e) => setLighting(e.target.value)}>
            {LIGHTING.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
          <Input label="Enquadramento" value={framing} onChange={(e) => setFraming(e.target.value)} placeholder="Close-up, plano médio, plano aberto..." />
          <Input label="Cenário" value={scenario} onChange={(e) => setScenario(e.target.value)} placeholder="Ex: escritório moderno" />
          <Input label="Ângulo da câmera" value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value)} placeholder="Frontal, superior, baixo ângulo..." />
        </div>

        <Slider label="Nível de realismo" min={0} max={100} value={realism} onChange={setRealism} marks={["Estilizado", "Equilibrado", "Ultrarrealista"]} />

        <div className="grid sm:grid-cols-2 gap-3">
          <Select label="Quantidade de imagens" value={count} onChange={(e) => setCount(e.target.value)}>
            {[1, 2, 4].map((n) => (
              <option key={n} value={n}>
                {n} {n > 1 ? "imagens" : "imagem"}
              </option>
            ))}
          </Select>
          <Input label="Elementos a evitar" value={avoid} onChange={(e) => setAvoid(e.target.value)} placeholder="Ex: texto, marca d'água, mãos deformadas" />
        </div>

        <Button icon={<Sparkles className="size-4" />} onClick={handleGenerate} loading={generating}>
          Gerar imagens
        </Button>

        {gallery.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            {gallery.map((src, i) => (
              <div key={i} className="rounded-xl border border-ink-700 overflow-hidden">
                <img src={src} alt={description} className="w-full aspect-square object-cover" />
                <div className="grid grid-cols-4 gap-0.5 p-1.5 bg-ink-900">
                  <IconAction icon={Plus} label="Adicionar" onClick={() => handleAdd(src)} />
                  <IconAction icon={RefreshCw} label="Variação" onClick={() => handleVariation(src)} />
                  <IconAction icon={Pencil} label="Prompt" onClick={() => setDescription((d) => `${d} (editado)`)} />
                  <IconAction icon={Wand2} label="Melhorar" onClick={() => pushToast("Qualidade aprimorada (simulado)", "success")} />
                  <IconAction icon={Scissors} label="Remover fundo" onClick={() => pushToast("Fundo removido (simulado)", "success")} />
                  <IconAction icon={Maximize2} label="Expandir" onClick={() => pushToast("Imagem expandida (simulado)", "success")} />
                  <IconAction icon={Save} label="Salvar" onClick={() => handleSaveToLibrary(src)} />
                  <IconAction icon={Trash2} label="Excluir" onClick={() => setGallery((g) => g.filter((s) => s !== src))} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function IconAction({ icon: Icon, label, onClick }: { icon: typeof Plus; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800 transition-colors">
      <Icon className="size-3.5" />
      <span className="text-[9px]">{label}</span>
    </button>
  );
}

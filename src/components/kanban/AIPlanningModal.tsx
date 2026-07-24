import { useState } from "react";
import { Modal, Button, Input, Select, ChipGroup } from "@/components/ui";
import type { BrandProfile, ContentFormat } from "@/types";
import { generateCalendarPlan, newSalt } from "@/lib/ai";
import { Sparkles } from "lucide-react";

const FORMAT_OPTIONS = [
  { key: "reels", label: "Reels" },
  { key: "carousel", label: "Carrossel" },
  { key: "stories", label: "Stories" },
];

export interface PlanCardDraft {
  title: string;
  format: ContentFormat;
  dueDate: string;
  notes: string;
}

export function AIPlanningModal({
  open,
  onClose,
  onGenerate,
  brand,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (cards: PlanCardDraft[]) => void;
  brand: BrandProfile;
}) {
  const [segment, setSegment] = useState(brand.segment);
  const [offer, setOffer] = useState(brand.offer);
  const [postsPerWeek, setPostsPerWeek] = useState("3");
  const [weeks, setWeeks] = useState("2");
  const [formats, setFormats] = useState<string[]>(["reels", "carousel", "stories"]);
  const [generating, setGenerating] = useState(false);

  function toggleFormat(key: string) {
    setFormats((f) => (f.includes(key) ? f.filter((x) => x !== key) : [...f, key]));
  }

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    const plan = generateCalendarPlan(
      {
        segment: segment || "seu segmento",
        objective: "engajamento",
        postsPerWeek: Number(postsPerWeek),
        formats: formats as ContentFormat[],
        weeks: Number(weeks),
        offer,
        startDate: new Date(),
      },
      newSalt()
    );
    setGenerating(false);
    onGenerate(plan.map((p) => ({ title: p.title, format: p.format, dueDate: p.date, notes: p.notes ?? "" })));
  }

  return (
    <Modal open={open} onClose={onClose} title="Gerar planejamento com IA" size="lg">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-300">
          A IA monta um conjunto de cards equilibrado entre educação, autoridade, engajamento, relacionamento, quebra de objeção e oferta — prontos para produzir.
        </p>
        <Input label="Segmento" value={segment} onChange={(e) => setSegment(e.target.value)} />
        <Input label="Produtos ou serviços que serão divulgados" value={offer} onChange={(e) => setOffer(e.target.value)} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Select label="Publicações por semana" value={postsPerWeek} onChange={(e) => setPostsPerWeek(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}x por semana
              </option>
            ))}
          </Select>
          <Select label="Período do planejamento" value={weeks} onChange={(e) => setWeeks(e.target.value)}>
            {[1, 2, 4, 6].map((n) => (
              <option key={n} value={n}>
                {n} semana{n > 1 ? "s" : ""}
              </option>
            ))}
          </Select>
        </div>
        <ChipGroup label="Formatos desejados" options={FORMAT_OPTIONS} value={formats} onChange={toggleFormat} multi />
        <Button icon={<Sparkles className="size-4" />} onClick={handleGenerate} loading={generating}>
          Gerar planejamento
        </Button>
      </div>
    </Modal>
  );
}

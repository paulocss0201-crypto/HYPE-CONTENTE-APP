import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, ChipGroup, Slider, Card, CardHover, Badge, EmptyState } from "@/components/ui";
import { useBrandStore } from "@/store/brandStore";
import { generateIdeas, newSalt } from "@/lib/ai";
import type { ContentFormat, IdeaCard } from "@/types";
import { Lightbulb, Clapperboard, Layers, CircleDot, Sparkles } from "lucide-react";

const COUNT_OPTIONS = [
  { key: "3", label: "3 ideias" },
  { key: "6", label: "6 ideias" },
  { key: "9", label: "9 ideias" },
];

const OBJECTIVE_OPTIONS = ["Educar", "Engajar", "Vender", "Gerar autoridade", "Atrair seguidores", "Quebrar objeções"];

const FORMAT_OPTIONS: { key: ContentFormat | "todos"; label: string }[] = [
  { key: "todos", label: "Todos os formatos" },
  { key: "reels", label: "Reels" },
  { key: "carousel", label: "Carrossel" },
  { key: "stories", label: "Stories" },
];

const FORMAT_ICON = { reels: Clapperboard, carousel: Layers, stories: CircleDot };

export function Ideas() {
  const navigate = useNavigate();
  const brand = useBrandStore((s) => s.profile);

  const [count, setCount] = useState("6");
  const [objective, setObjective] = useState("Educar");
  const [format, setFormat] = useState<ContentFormat | "todos">("todos");
  const [theme, setTheme] = useState("");
  const [creativity, setCreativity] = useState(60);
  const [ideas, setIdeas] = useState<IdeaCard[]>([]);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1400));
    const result = generateIdeas({ count: Number(count), objective, format, theme, creativity, brand, salt: newSalt() });
    setIdeas(result);
    setGenerating(false);
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      <PageHeader title="Ideias de conteúdo" description="A Inteligência Artificial sugere pautas personalizadas com base no perfil da sua marca." />

      <Card className="p-5 mb-6 flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Tema (opcional)" placeholder="Ex: produtividade, vendas, bem-estar" value={theme} onChange={(e) => setTheme(e.target.value)} />
          <ChipGroup label="Quantidade de ideias" options={COUNT_OPTIONS} value={count} onChange={setCount} />
        </div>
        <ChipGroup label="Objetivo" options={OBJECTIVE_OPTIONS.map((o) => ({ key: o, label: o }))} value={objective} onChange={setObjective} />
        <ChipGroup label="Formato" options={FORMAT_OPTIONS.map((f) => ({ key: f.key, label: f.label }))} value={format} onChange={(v) => setFormat(v as ContentFormat | "todos")} />
        <Slider label="Nível de criatividade" value={creativity} onChange={setCreativity} marks={["Conservador", "Equilibrado", "Ousado"]} />
        <Button icon={<Sparkles className="size-4" />} onClick={handleGenerate} loading={generating} className="self-start">
          Gerar ideias
        </Button>
      </Card>

      {ideas.length === 0 ? (
        <Card>
          <EmptyState icon={<Lightbulb className="size-6" />} title="Suas ideias aparecerão aqui" description="Configure os filtros acima e clique em “Gerar ideias” para receber sugestões personalizadas." />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => {
            const Icon = FORMAT_ICON[idea.format];
            return (
              <CardHover key={idea.id} className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge>{idea.category}</Badge>
                  <div className="size-8 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-ink-200" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-white mb-1">{idea.title}</p>
                  <p className="text-xs text-ink-300 mb-2">{idea.description}</p>
                  <p className="text-xs text-ink-200 italic">"{idea.hook}"</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-auto"
                  onClick={() => navigate(`/create/${idea.format}`, { state: { theme: idea.title, objective: idea.objective, autoGenerate: false } })}
                >
                  Criar este conteúdo
                </Button>
              </CardHover>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, Textarea, ChipGroup, Slider, Switch, Card, CardHover } from "@/components/ui";
import { OBJECTIVE_OPTIONS, TONE_OPTIONS } from "@/types";
import type { ContentFormat } from "@/types";
import { useBrandStore } from "@/store/brandStore";
import { Clapperboard, Layers, CircleDot, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratorNavState } from "./generators/GeneratorNavState";

const FORMATS: { key: ContentFormat; label: string; description: string; icon: typeof Clapperboard }[] = [
  { key: "reels", label: "Reels", description: "Roteiro estratégico para vídeos curtos.", icon: Clapperboard },
  { key: "carousel", label: "Carrossel", description: "Sequência de slides educativos ou persuasivos.", icon: Layers },
  { key: "stories", label: "Stories", description: "Sequência para gerar conexão e engajamento.", icon: CircleDot },
];

export function CreateContent() {
  const navigate = useNavigate();
  const brand = useBrandStore((s) => s.profile);
  const [step, setStep] = useState<1 | 2>(1);
  const [format, setFormat] = useState<ContentFormat | null>(null);

  const [theme, setTheme] = useState("");
  const [offer, setOffer] = useState(brand.offer ?? "");
  const [objective, setObjective] = useState("educar");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<string>(brand.tone || "profissional");
  const [creativity, setCreativity] = useState(60);
  const [cta, setCta] = useState("");
  const [extra, setExtra] = useState("");
  const [useBrandInfo, setUseBrandInfo] = useState(true);
  const [error, setError] = useState("");

  function selectFormat(f: ContentFormat) {
    setFormat(f);
    setStep(2);
  }

  function handleGenerate() {
    if (!theme.trim()) {
      setError("Preencha o tema do conteúdo para continuar.");
      return;
    }
    if (!format) return;
    const state: GeneratorNavState = {
      theme,
      offer,
      objective,
      audience,
      tone,
      creativity,
      cta,
      extra,
      useBrandInfo,
      autoGenerate: true,
    };
    navigate(`/create/${format}`, { state });
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
      <PageHeader title="Criar conteúdo" description="Transforme uma ideia, tema, produto ou objetivo em um conteúdo estratégico pronto para publicar." />

      {step === 1 && (
        <div className="grid sm:grid-cols-3 gap-4">
          {FORMATS.map((f) => (
            <CardHover key={f.key} onClick={() => selectFormat(f.key)} className="p-6 cursor-pointer flex flex-col gap-3">
              <div className="size-11 rounded-xl bg-ink-800 border border-ink-600 flex items-center justify-center">
                <f.icon className="size-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">{f.label}</p>
                <p className="text-sm text-ink-300">{f.description}</p>
              </div>
            </CardHover>
          ))}
        </div>
      )}

      {step === 2 && format && (
        <Card className="p-6 flex flex-col gap-4 max-w-xl">
          <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-ink-300 hover:text-white transition-colors w-fit">
            <ChevronLeft className="size-4" /> Trocar formato
          </button>

          <div className="flex items-center gap-2 mb-1">
            {FORMATS.filter((f) => f.key === format).map((f) => (
              <div key={f.key} className="flex items-center gap-2 rounded-full bg-ink-800 border border-ink-600 px-3 py-1.5 text-sm">
                <f.icon className="size-4" /> {f.label}
              </div>
            ))}
          </div>

          <Input label="Tema do conteúdo" placeholder="Ex: como precificar meus serviços" value={theme} onChange={(e) => { setTheme(e.target.value); setError(""); }} error={error} />
          <Input label="Produto ou serviço relacionado" placeholder="Opcional" value={offer} onChange={(e) => setOffer(e.target.value)} />
          <ChipGroup label="Objetivo do conteúdo" options={OBJECTIVE_OPTIONS.map((o) => ({ key: o.key, label: o.label }))} value={objective} onChange={setObjective} />
          <Textarea label="Público-alvo" rows={2} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Opcional se usar informações da marca" />
          <ChipGroup label="Tom de voz" options={TONE_OPTIONS.map((o) => ({ key: o.key, label: o.label }))} value={tone} onChange={setTone} />
          <Slider label="Nível de criatividade" value={creativity} onChange={setCreativity} marks={["Conservador", "Equilibrado", "Ousado"]} />
          <Input label="Chamada para ação desejada" placeholder="Opcional" value={cta} onChange={(e) => setCta(e.target.value)} />
          <Textarea label="Informações adicionais" rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Opcional" />

          <div className={cn("rounded-xl border border-ink-700 bg-ink-900/50 p-3")}>
            <Switch checked={useBrandInfo} onChange={setUseBrandInfo} label="Usar informações salvas da minha marca" description="A IA usa segmento, público, dores, desejos e tom automaticamente" />
          </div>

          <Button size="lg" icon={<Check className="size-4" />} onClick={handleGenerate}>
            Gerar conteúdo com IA
          </Button>
        </Card>
      )}
    </div>
  );
}

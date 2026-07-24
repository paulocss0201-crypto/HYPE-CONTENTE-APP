import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, Textarea, ChipGroup, Select, Card } from "@/components/ui";
import { useBrandStore } from "@/store/brandStore";
import { useUiStore } from "@/store/uiStore";
import { MAIN_GOAL_OPTIONS, TONE_OPTIONS } from "@/types";
import { Save, Mic } from "lucide-react";

const FREQUENCY_OPTIONS = [
  { key: "1x", label: "1x por semana" },
  { key: "3x", label: "3x por semana" },
  { key: "5x", label: "5x por semana" },
  { key: "diaria", label: "Todos os dias" },
];

export function Brand() {
  const profile = useBrandStore((s) => s.profile);
  const setProfile = useBrandStore((s) => s.setProfile);
  const pushToast = useUiStore((s) => s.pushToast);
  const [local, setLocal] = useState(profile);

  function update<K extends keyof typeof local>(key: K, value: (typeof local)[K]) {
    setLocal((s) => ({ ...s, [key]: value }));
  }

  function handleSave() {
    setProfile(local);
    pushToast("Perfil da marca atualizado", "success");
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
      <PageHeader
        title="Marca e público"
        description="Essas informações são usadas pela Inteligência Artificial para manter consistência estratégica em todos os conteúdos."
        action={
          <Button icon={<Save className="size-4" />} onClick={handleSave}>
            Salvar alterações
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        <Card className="p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold">Identidade</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome da marca" value={local.brandName} onChange={(e) => update("brandName", e.target.value)} />
            <Input label="Segmento" value={local.segment} onChange={(e) => update("segment", e.target.value)} />
          </div>
          <Textarea label="Descrição" rows={3} value={local.description} onChange={(e) => update("description", e.target.value)} placeholder="Uma breve descrição sobre a marca" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Site" value={local.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
            <Input label="Instagram" value={local.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@usuario" />
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold">Oferta e público</p>
          <Textarea label="Produtos ou serviços" rows={2} value={local.offer} onChange={(e) => update("offer", e.target.value)} />
          <Textarea label="Público-alvo" rows={2} value={local.audience} onChange={(e) => update("audience", e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Textarea label="Dores" rows={3} value={local.painPoints} onChange={(e) => update("painPoints", e.target.value)} />
            <Textarea label="Desejos" rows={3} value={local.desires} onChange={(e) => update("desires", e.target.value)} />
          </div>
          <Textarea label="Objeções" rows={2} value={local.objections} onChange={(e) => update("objections", e.target.value)} placeholder="Principais objeções que seu público costuma ter" />
          <Textarea label="Diferenciais da marca" rows={3} value={local.differentiators} onChange={(e) => update("differentiators", e.target.value)} />
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold">Estratégia</p>
          <ChipGroup label="Objetivo principal" options={MAIN_GOAL_OPTIONS.map((o) => ({ key: o.key, label: o.label }))} value={local.mainGoal} onChange={(v) => update("mainGoal", v as typeof local.mainGoal)} />
          <ChipGroup label="Tom de voz" options={TONE_OPTIONS.map((o) => ({ key: o.key, label: o.label }))} value={local.tone} onChange={(v) => update("tone", v as typeof local.tone)} />
          <Select label="Frequência desejada de publicações" value={local.frequency} onChange={(e) => update("frequency", e.target.value)}>
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </Select>
          <Input label="Chamada para ação principal" value={local.mainCta} onChange={(e) => update("mainCta", e.target.value)} placeholder="Ex: manda um direct com a palavra CURSO" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Textarea label="Palavras que devem ser utilizadas" rows={2} value={local.wordsToUse} onChange={(e) => update("wordsToUse", e.target.value)} />
            <Textarea label="Palavras que devem ser evitadas" rows={2} value={local.wordsToAvoid} onChange={(e) => update("wordsToAvoid", e.target.value)} />
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Mic className="size-4 text-ink-300" />
            <p className="text-sm font-semibold">Voz da marca</p>
          </div>
          <p className="text-xs text-ink-300 -mt-2">Cole exemplos de textos que representem a comunicação da sua marca. A IA usa isso para manter consistência.</p>
          <Textarea rows={6} value={local.voiceSamples} onChange={(e) => update("voiceSamples", e.target.value)} placeholder="Cole aqui legendas, roteiros ou textos que representam bem sua marca..." />
        </Card>

        <Button size="lg" icon={<Save className="size-4" />} onClick={handleSave} className="self-start">
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft } from "lucide-react";
import { Button, Input, Textarea, ChipGroup, Select, ProgressBar } from "@/components/ui";
import { useBrandStore } from "@/store/brandStore";
import { useAuthStore } from "@/store/authStore";
import { MAIN_GOAL_OPTIONS, TONE_OPTIONS } from "@/types";

const FREQUENCY_OPTIONS = [
  { key: "1x", label: "1x por semana" },
  { key: "3x", label: "3x por semana" },
  { key: "5x", label: "5x por semana" },
  { key: "diaria", label: "Todos os dias" },
];

const STEPS = ["Sobre você", "Público e oferta", "Diferenciais", "Objetivo e voz"];

export function Onboarding() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useBrandStore((s) => s.profile);
  const setProfile = useBrandStore((s) => s.setProfile);
  const completeOnboarding = useBrandStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [local, setLocal] = useState({
    userName: profile.userName || user?.name || "",
    brandName: profile.brandName,
    segment: profile.segment,
    offer: profile.offer,
    audience: profile.audience,
    painPoints: profile.painPoints,
    desires: profile.desires,
    differentiators: profile.differentiators,
    mainGoal: profile.mainGoal,
    tone: profile.tone,
    frequency: profile.frequency || "3x",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof local>(key: K, value: (typeof local)[K]) {
    setLocal((s) => ({ ...s, [key]: value }));
  }

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!local.userName.trim()) e.userName = "Informe seu nome.";
      if (!local.brandName.trim()) e.brandName = "Informe o nome da sua marca ou empresa.";
      if (!local.segment.trim()) e.segment = "Informe seu segmento de atuação.";
    }
    if (step === 1) {
      if (!local.offer.trim()) e.offer = "Descreva seu produto ou serviço.";
      if (!local.audience.trim()) e.audience = "Descreva seu público-alvo.";
    }
    if (step === 3) {
      if (!local.mainGoal) e.mainGoal = "Selecione um objetivo principal.";
      if (!local.tone) e.tone = "Selecione um tom de voz.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    setProfile(local);
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setProfile(local);
      completeOnboarding();
      navigate("/");
    }
  }

  function handleBack() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="size-8 rounded-lg bg-white flex items-center justify-center">
            <Sparkles className="size-4.5 text-ink-950" />
          </div>
          <span className="text-lg font-semibold">Hype Conteúdo</span>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-xs text-ink-300">
            <span>
              Passo {step + 1} de {STEPS.length}
            </span>
            <span>{STEPS[step]}</span>
          </div>
          <ProgressBar value={((step + 1) / STEPS.length) * 100} />
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              {step === 0 && (
                <>
                  <StepHeader
                    title="Vamos configurar seu perfil estratégico"
                    description="Essas informações personalizam automaticamente todos os conteúdos gerados pela IA."
                  />
                  <Input label="Seu nome" value={local.userName} onChange={(e) => update("userName", e.target.value)} error={errors.userName} placeholder="Ex: Ana Silva" />
                  <Input label="Nome da marca ou empresa" value={local.brandName} onChange={(e) => update("brandName", e.target.value)} error={errors.brandName} placeholder="Ex: Ana Silva Consultoria" />
                  <Input label="Segmento de atuação" value={local.segment} onChange={(e) => update("segment", e.target.value)} error={errors.segment} placeholder="Ex: nutrição esportiva" />
                </>
              )}

              {step === 1 && (
                <>
                  <StepHeader title="Sobre sua oferta e seu público" description="Quanto mais específico, mais estratégico fica o conteúdo gerado." />
                  <Textarea label="Produto ou serviço oferecido" value={local.offer} onChange={(e) => update("offer", e.target.value)} error={errors.offer} rows={2} placeholder="Ex: mentoria individual de emagrecimento saudável" />
                  <Textarea label="Público-alvo" value={local.audience} onChange={(e) => update("audience", e.target.value)} error={errors.audience} rows={2} placeholder="Ex: mulheres de 30 a 45 anos que querem emagrecer sem dietas restritivas" />
                  <Textarea label="Principais dores do público" value={local.painPoints} onChange={(e) => update("painPoints", e.target.value)} rows={2} placeholder="Ex: falta de tempo, efeito sanfona, dietas restritivas" />
                  <Textarea label="Principais desejos do público" value={local.desires} onChange={(e) => update("desires", e.target.value)} rows={2} placeholder="Ex: emagrecer com liberdade, ter mais energia, se sentir bem no espelho" />
                </>
              )}

              {step === 2 && (
                <>
                  <StepHeader title="O que torna sua marca diferente" description="Use isso para reforçar sua autoridade nos conteúdos." />
                  <Textarea label="Diferenciais da marca" value={local.differentiators} onChange={(e) => update("differentiators", e.target.value)} rows={4} placeholder="Ex: método próprio validado, atendimento personalizado, resultados comprovados" />
                </>
              )}

              {step === 3 && (
                <>
                  <StepHeader title="Objetivo e tom de voz" description="Isso define a estratégia e a linguagem de todos os conteúdos criados." />
                  <ChipGroup
                    label="Objetivo principal no Instagram"
                    options={MAIN_GOAL_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
                    value={local.mainGoal}
                    onChange={(v) => update("mainGoal", v as typeof local.mainGoal)}
                    error={errors.mainGoal}
                  />
                  <ChipGroup
                    label="Tom de voz da comunicação"
                    options={TONE_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
                    value={local.tone}
                    onChange={(v) => update("tone", v as typeof local.tone)}
                    error={errors.tone}
                  />
                  <Select label="Frequência desejada de publicações" value={local.frequency} onChange={(e) => update("frequency", e.target.value)}>
                    {FREQUENCY_OPTIONS.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label}
                      </option>
                    ))}
                  </Select>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <Button variant="ghost" onClick={handleBack} disabled={step === 0} icon={<ChevronLeft className="size-4" />}>
              Voltar
            </Button>
            <Button onClick={handleNext}>{step === STEPS.length - 1 ? "Concluir" : "Continuar"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-sm text-ink-300">{description}</p>
    </div>
  );
}

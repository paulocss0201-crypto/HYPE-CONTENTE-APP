import { useState } from "react";
import { Modal, Button, Textarea, Input } from "@/components/ui";
import { expandVisualPrompt, formatExpandedPrompt, refinePromptText } from "@/lib/design-ai";
import type { PromptRefineAction } from "@/lib/design-ai";
import { useBrandStore } from "@/store/brandStore";
import { Wand2, Sparkles } from "lucide-react";

const REFINE_ACTIONS: { key: PromptRefineAction; label: string }[] = [
  { key: "melhorar", label: "Melhorar meu prompt" },
  { key: "realista", label: "Deixar mais realista" },
  { key: "cinematografico", label: "Deixar mais cinematográfico" },
  { key: "premium", label: "Deixar mais premium" },
  { key: "adaptar_marca", label: "Adaptar para minha marca" },
  { key: "variacao", label: "Criar variações" },
];

export function PromptAssistantModal({ open, onClose, onUsePrompt }: { open: boolean; onClose: () => void; onUsePrompt: (prompt: string) => void }) {
  const brand = useBrandStore((s) => s.profile);
  const [simple, setSimple] = useState("");
  const [expanded, setExpanded] = useState("");

  function handleExpand() {
    const parts = expandVisualPrompt(simple, Date.now());
    setExpanded(formatExpandedPrompt(parts));
  }

  function handleRefine(action: PromptRefineAction) {
    setExpanded((prev) => refinePromptText(prev || simple, action, brand.brandName, Date.now()));
  }

  return (
    <Modal open={open} onClose={onClose} title="Assistente de prompt visual" size="lg">
      <div className="flex flex-col gap-4">
        <Input label="Descreva de forma simples o que você quer" value={simple} onChange={(e) => setSimple(e.target.value)} placeholder="Ex: Quero uma imagem de um empresário usando inteligência artificial" />
        <Button icon={<Wand2 className="size-4" />} onClick={handleExpand}>
          Transformar em prompt detalhado
        </Button>

        {expanded && (
          <>
            <Textarea label="Prompt visual detalhado" rows={7} value={expanded} onChange={(e) => setExpanded(e.target.value)} />
            <div className="flex flex-wrap gap-1.5">
              {REFINE_ACTIONS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => handleRefine(a.key)}
                  className="text-xs rounded-full border border-ink-600 px-2.5 py-1.5 text-ink-100 hover:border-ink-400 hover:text-white transition-colors"
                >
                  {a.label}
                </button>
              ))}
            </div>
            <Button
              variant="secondary"
              icon={<Sparkles className="size-4" />}
              onClick={() => {
                onUsePrompt(expanded);
                onClose();
              }}
            >
              Usar este prompt no gerador de imagens
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}

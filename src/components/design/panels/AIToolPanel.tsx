import { useState } from "react";
import { Button, Textarea } from "@/components/ui";
import { Sparkles, ImagePlus, Wand2 } from "lucide-react";

export function AIToolPanel({
  onGenerateDesign,
  onOpenImageGenerator,
  onOpenPromptAssistant,
  generating,
}: {
  onGenerateDesign: (prompt: string) => void;
  onOpenImageGenerator: () => void;
  onOpenPromptAssistant: () => void;
  generating?: boolean;
}) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-ink-300">Descreva como você quer o seu design</p>
        <Textarea
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Crie um carrossel premium, com fundo preto, tipografia branca, detalhes em cinza, imagens futuristas e uma composição minimalista."
        />
        <Button icon={<Sparkles className="size-4" />} onClick={() => onGenerateDesign(prompt)} loading={generating}>
          Gerar design com IA
        </Button>
      </div>

      <div className="h-px bg-ink-750" />

      <Button variant="outline" icon={<ImagePlus className="size-4" />} onClick={onOpenImageGenerator}>
        Gerar imagem com IA
      </Button>
      <Button variant="outline" icon={<Wand2 className="size-4" />} onClick={onOpenPromptAssistant}>
        Assistente de prompt visual
      </Button>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui";
import type { RefineAction } from "@/lib/ai";
import type { ContentFormat } from "@/types";
import { RefreshCw, Wand2, Scissors, Briefcase, Anchor, MousePointerClick, ArrowRightLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FORMAT_LABEL: Record<ContentFormat, string> = {
  reels: "Roteiro de Reels",
  carousel: "Carrossel",
  stories: "Sequência de Stories",
};

export function ContentToolbar({
  currentFormat,
  onRefine,
  onRegenerateAll,
  onTransform,
  regenerating,
}: {
  currentFormat: ContentFormat;
  onRefine: (action: RefineAction) => void;
  onRegenerateAll: () => void;
  onTransform: (format: ContentFormat) => void;
  regenerating?: boolean;
}) {
  const [transformOpen, setTransformOpen] = useState(false);
  const otherFormats = (["reels", "carousel", "stories"] as ContentFormat[]).filter((f) => f !== currentFormat);

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-ink-850 border border-ink-700">
      <Button size="sm" variant="secondary" icon={<RefreshCw className="size-3.5" />} onClick={onRegenerateAll} loading={regenerating}>
        Regenerar tudo
      </Button>
      <Button size="sm" variant="ghost" icon={<Anchor className="size-3.5" />} onClick={() => onRefine("hook")}>
        Regenerar gancho
      </Button>
      <Button size="sm" variant="ghost" icon={<MousePointerClick className="size-3.5" />} onClick={() => onRefine("cta")}>
        Regenerar CTA
      </Button>
      <Button size="sm" variant="ghost" icon={<Scissors className="size-3.5" />} onClick={() => onRefine("shorten")}>
        Mais curto
      </Button>
      <Button size="sm" variant="ghost" icon={<Wand2 className="size-3.5" />} onClick={() => onRefine("persuasive")}>
        Mais persuasivo
      </Button>
      <Button size="sm" variant="ghost" icon={<Briefcase className="size-3.5" />} onClick={() => onRefine("professional")}>
        Mais profissional
      </Button>

      <div className="relative ml-auto">
        <Button size="sm" variant="outline" icon={<ArrowRightLeft className="size-3.5" />} iconRight={<ChevronDown className="size-3.5" />} onClick={() => setTransformOpen((o) => !o)}>
          Transformar em
        </Button>
        {transformOpen && (
          <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl p-1.5 shadow-lg z-10 animate-fade-up">
            {otherFormats.map((f) => (
              <button
                key={f}
                onClick={() => {
                  onTransform(f);
                  setTransformOpen(false);
                }}
                className={cn("w-full text-left px-3 py-2 rounded-lg text-sm text-ink-100 hover:bg-ink-800 hover:text-white transition-colors")}
              >
                {FORMAT_LABEL[f]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

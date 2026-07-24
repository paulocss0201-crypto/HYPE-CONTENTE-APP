import { Modal, ProgressBar } from "@/components/ui";
import type { DesignScoreResult } from "@/lib/design-ai";
import { Sparkles } from "lucide-react";

const SUB_SCORE_LABEL: Record<keyof DesignScoreResult["subScores"], string> = {
  hierarquia: "Hierarquia visual",
  legibilidade: "Legibilidade",
  consistencia: "Consistência",
  impacto: "Impacto",
  identidadeDeMarca: "Identidade de marca",
  clarezaDaMensagem: "Clareza da mensagem",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-danger";
}

export function DesignScoreModal({
  open,
  onClose,
  result,
  onAutoFix,
}: {
  open: boolean;
  onClose: () => void;
  result: DesignScoreResult | null;
  onAutoFix: () => void;
}) {
  if (!result) return null;

  return (
    <Modal open={open} onClose={onClose} title="Analisar design">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className={"text-4xl font-bold " + scoreColor(result.score)}>{result.score}</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Pontuação geral</p>
            <p className="text-xs text-ink-300">De 0 a 100, considerando hierarquia, legibilidade, consistência, impacto, identidade e clareza.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {(Object.keys(result.subScores) as (keyof DesignScoreResult["subScores"])[]).map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-200">{SUB_SCORE_LABEL[key]}</span>
                <span className={scoreColor(result.subScores[key])}>{result.subScores[key]}</span>
              </div>
              <ProgressBar value={result.subScores[key]} />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-ink-300">Sugestões</p>
          <ul className="flex flex-col gap-1.5">
            {result.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-ink-200 rounded-lg bg-ink-850 border border-ink-700 px-3 py-2">
                {s}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onAutoFix}
          className="flex items-center justify-center gap-1.5 text-sm rounded-xl bg-white text-ink-950 font-medium py-2.5 hover:bg-ink-100 transition-colors"
        >
          <Sparkles className="size-4" /> Corrigir automaticamente
        </button>
      </div>
    </Modal>
  );
}

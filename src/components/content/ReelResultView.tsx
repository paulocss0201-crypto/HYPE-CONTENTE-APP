import type { ReelContent } from "@/types";
import { Card } from "@/components/ui";
import { EditableText } from "./EditableText";
import { Clapperboard, Music2, MonitorPlay, Hash, ListChecks } from "lucide-react";

export function ReelResultView({ content, onChange }: { content: ReelContent; onChange: (content: ReelContent) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="text-xs font-medium text-ink-300 mb-1">TÍTULO DO CONTEÚDO</p>
        <h2 className="text-lg font-semibold mb-3">{content.title}</h2>
        <p className="text-xs font-medium text-ink-300 mb-1">GANCHO INICIAL</p>
        <EditableText value={content.hook} onChange={(v) => onChange({ ...content, hook: v })} multiline textClassName="text-base text-white font-medium" />
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clapperboard className="size-4 text-ink-300" />
          <p className="text-sm font-semibold">Roteiro por cenas</p>
        </div>
        <div className="flex flex-col gap-4">
          {content.scenes.map((scene, i) => (
            <div key={scene.scene} className="rounded-xl border border-ink-700 p-4 bg-ink-900/60">
              <p className="text-xs font-semibold text-ink-200 mb-2">Cena {scene.scene}</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-1">Visual</p>
                  <EditableText
                    value={scene.visual}
                    onChange={(v) => {
                      const scenes = [...content.scenes];
                      scenes[i] = { ...scene, visual: v };
                      onChange({ ...content, scenes, visualSuggestions: scenes.map((s) => s.visual) });
                    }}
                    multiline
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-1">Texto na tela</p>
                  <EditableText
                    value={scene.onScreenText}
                    onChange={(v) => {
                      const scenes = [...content.scenes];
                      scenes[i] = { ...scene, onScreenText: v };
                      onChange({ ...content, scenes, onScreenTextSuggestions: scenes.map((s) => s.onScreenText) });
                    }}
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-1">Fala / narração</p>
                  <EditableText
                    value={scene.narration}
                    onChange={(v) => {
                      const scenes = [...content.scenes];
                      scenes[i] = { ...scene, narration: v };
                      onChange({ ...content, scenes, narrationFull: scenes.map((s) => s.narration).join(" ") });
                    }}
                    multiline
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-xs font-medium text-ink-300 mb-1">CHAMADA PARA AÇÃO</p>
        <EditableText value={content.cta} onChange={(v) => onChange({ ...content, cta: v })} multiline />
      </Card>

      <Card className="p-5">
        <p className="text-xs font-medium text-ink-300 mb-1">LEGENDA PARA PUBLICAÇÃO</p>
        <EditableText value={content.caption} onChange={(v) => onChange({ ...content, caption: v })} multiline />
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="size-4 text-ink-300" />
            <p className="text-sm font-semibold">Hashtags</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {content.hashtags.map((tag) => (
              <span key={tag} className="text-xs bg-ink-800 border border-ink-600 rounded-full px-2.5 py-1 text-ink-100">
                {tag}
              </span>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Music2 className="size-4 text-ink-300" />
            <p className="text-sm font-semibold">Música / estilo de áudio</p>
          </div>
          <p className="text-sm text-ink-100">{content.audioSuggestion}</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <ListChecks className="size-4 text-ink-300" />
          <p className="text-sm font-semibold">Dicas de gravação e edição</p>
        </div>
        <ul className="flex flex-col gap-1.5">
          {content.recordingTips.map((tip, i) => (
            <li key={i} className="text-sm text-ink-100 flex gap-2">
              <MonitorPlay className="size-3.5 text-ink-400 shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

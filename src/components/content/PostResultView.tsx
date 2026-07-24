import type { PostContent } from "@/types";
import { Card } from "@/components/ui";
import { EditableText } from "./EditableText";

export function PostResultView({ content, onChange }: { content: PostContent; onChange: (content: PostContent) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="text-xs font-medium text-ink-300 mb-1">TÍTULO</p>
        <EditableText value={content.title} onChange={(v) => onChange({ ...content, title: v })} textClassName="text-base text-white font-medium" />
      </Card>
      <Card className="p-5">
        <p className="text-xs font-medium text-ink-300 mb-1">LEGENDA</p>
        <EditableText value={content.caption} onChange={(v) => onChange({ ...content, caption: v })} multiline />
      </Card>
      <Card className="p-5">
        <p className="text-xs font-medium text-ink-300 mb-1">CHAMADA PARA AÇÃO</p>
        <EditableText value={content.cta} onChange={(v) => onChange({ ...content, cta: v })} multiline />
      </Card>
      <Card className="p-5">
        <p className="text-xs font-medium text-ink-300 mb-1">OBSERVAÇÕES</p>
        <EditableText value={content.notes} onChange={(v) => onChange({ ...content, notes: v })} multiline />
      </Card>
    </div>
  );
}

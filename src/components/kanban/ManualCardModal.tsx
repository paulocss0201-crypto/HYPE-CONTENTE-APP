import { useState } from "react";
import { Modal, Button, Input, Textarea, ChipGroup, Select } from "@/components/ui";
import type { ContentFormat, Priority } from "@/types";
import { FORMAT_LABEL, PRIORITY_LABEL, SUGGESTED_LABELS } from "@/types";

const FORMAT_OPTIONS: { key: ContentFormat; label: string }[] = (["reels", "carousel", "stories", "post"] as ContentFormat[]).map((f) => ({
  key: f,
  label: FORMAT_LABEL[f],
}));

const PRIORITY_OPTIONS: { key: Priority; label: string }[] = (["baixa", "media", "alta", "urgente"] as Priority[]).map((p) => ({
  key: p,
  label: PRIORITY_LABEL[p],
}));

export function ManualCardModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    format: ContentFormat;
    objective: string;
    priority: Priority;
    responsible: string;
    platform: string;
    labels: string[];
    dueDate: string;
    notes: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<ContentFormat>("post");
  const [objective, setObjective] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [responsible, setResponsible] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [labels, setLabels] = useState<string[]>([]);
  const [customLabel, setCustomLabel] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function toggleLabel(label: string) {
    setLabels((l) => (l.includes(label) ? l.filter((x) => x !== label) : [...l, label]));
  }

  function addCustomLabel() {
    const value = customLabel.trim();
    if (value && !labels.includes(value)) setLabels((l) => [...l, value]);
    setCustomLabel("");
  }

  function reset() {
    setTitle("");
    setFormat("post");
    setObjective("");
    setPriority("media");
    setResponsible("");
    setPlatform("Instagram");
    setLabels([]);
    setCustomLabel("");
    setDueDate("");
    setNotes("");
    setError("");
  }

  function handleCreate() {
    if (!title.trim()) {
      setError("Dê um título para o conteúdo.");
      return;
    }
    onCreate({ title, format, objective, priority, responsible, platform, labels, dueDate, notes });
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
      }}
      title="Adicionar card manualmente"
      size="lg"
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Título do conteúdo"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          error={error}
        />
        <ChipGroup label="Formato" options={FORMAT_OPTIONS} value={format} onChange={(v) => setFormat(v as ContentFormat)} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Objetivo" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ex: gerar autoridade" />
          <Input label="Responsável" value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Ex: seu nome" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Select label="Plataforma" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="Instagram">Instagram</option>
            <option value="Instagram Reels">Instagram Reels</option>
            <option value="Instagram Stories">Instagram Stories</option>
          </Select>
          <Input label="Data prevista de publicação" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <ChipGroup label="Prioridade" options={PRIORITY_OPTIONS} value={priority} onChange={(v) => setPriority(v as Priority)} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink-100">Etiquetas</label>
          <ChipGroup options={SUGGESTED_LABELS.map((l) => ({ key: l, label: l }))} value={labels} onChange={toggleLabel} multi />
          <div className="flex gap-2">
            <Input
              placeholder="Etiqueta personalizada"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomLabel()}
            />
            <Button variant="outline" size="sm" onClick={addCustomLabel}>
              Adicionar
            </Button>
          </div>
          {labels.filter((l) => !SUGGESTED_LABELS.includes(l)).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {labels
                .filter((l) => !SUGGESTED_LABELS.includes(l))
                .map((l) => (
                  <span key={l} className="text-xs bg-ink-800 border border-ink-600 rounded-full px-2.5 py-1 text-ink-100">
                    {l}
                  </span>
                ))}
            </div>
          )}
        </div>
        <Textarea label="Observações" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Copy, legenda ou notas sobre este conteúdo" />
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>Criar card</Button>
        </div>
      </div>
    </Modal>
  );
}

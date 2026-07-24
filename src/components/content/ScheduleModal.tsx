import { useState } from "react";
import { Modal } from "@/components/ui";
import { Button, Input, Select, Textarea } from "@/components/ui";
import type { ProjectStatus } from "@/types";
import { STATUS_LABEL } from "@/types";

export function ScheduleModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { date: string; time: string; status: ProjectStatus; notes: string }) => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [status, setStatus] = useState<ProjectStatus>("scheduled");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleConfirm() {
    if (!date) {
      setError("Selecione uma data para continuar.");
      return;
    }
    onConfirm({ date, time, status, notes });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Agendar publicação">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Data"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setError("");
            }}
            error={error}
          />
          <Input label="Horário" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
          {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Textarea label="Observações" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Adicionar ao calendário</Button>
        </div>
      </div>
    </Modal>
  );
}

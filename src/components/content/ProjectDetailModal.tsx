import { Modal } from "@/components/ui";
import type { Project } from "@/types";
import { ReelResultView } from "./ReelResultView";
import { CarouselResultView } from "./CarouselResultView";
import { StoriesResultView } from "./StoriesResultView";
import { ResultActionsBar } from "./ResultActionsBar";
import { useContentStore } from "@/store/contentStore";
import { useUiStore } from "@/store/uiStore";
import { contentToText, copyToClipboard, downloadTextFile, exportAsDocument } from "@/lib/exportContent";
import { useState } from "react";
import { ScheduleModal } from "./ScheduleModal";

export function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const updateProjectContent = useContentStore((s) => s.updateProjectContent);
  const toggleFavorite = useContentStore((s) => s.toggleFavorite);
  const updateProject = useContentStore((s) => s.updateProject);
  const addCalendarEntry = useContentStore((s) => s.addCalendarEntry);
  const pushToast = useUiStore((s) => s.pushToast);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const content = project.content;

  function handleChange(newContent: typeof content) {
    updateProject(project.id, { content: newContent });
  }

  async function handleCopy() {
    await copyToClipboard(contentToText(content, project.title));
    pushToast("Conteúdo copiado", "success");
  }

  function handleSave() {
    updateProjectContent(project.id, content, "Edição manual");
    pushToast("Nova versão criada", "success");
  }

  return (
    <Modal open onClose={onClose} title={project.title} size="lg">
      <div className="flex flex-col gap-4">
        {content.format === "reels" && <ReelResultView content={content.data} onChange={(data) => handleChange({ format: "reels", data })} />}
        {content.format === "carousel" && <CarouselResultView content={content.data} onChange={(data) => handleChange({ format: "carousel", data })} />}
        {content.format === "stories" && <StoriesResultView content={content.data} onChange={(data) => handleChange({ format: "stories", data })} />}
        <ResultActionsBar
          onCopy={handleCopy}
          onSave={handleSave}
          onFavorite={() => toggleFavorite(project.id)}
          onExportText={() => downloadTextFile(contentToText(content, project.title), `${project.title}.txt`)}
          onExportDocument={() => exportAsDocument(contentToText(content, project.title), project.title)}
          onSchedule={() => setScheduleOpen(true)}
          favorite={project.favorite}
          saved
        />
      </div>
      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onConfirm={(data) => {
          addCalendarEntry({ title: project.title, format: project.format, date: data.date, time: data.time, status: data.status, notes: data.notes, projectId: project.id });
          updateProject(project.id, { status: data.status, scheduledDate: data.date, scheduledTime: data.time });
          pushToast("Publicação agendada no calendário", "success");
        }}
      />
    </Modal>
  );
}

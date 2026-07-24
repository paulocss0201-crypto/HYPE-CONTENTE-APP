import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CalendarEntry,
  GeneratedContent,
  KanbanStage,
  Priority,
  Project,
  ProjectStatus,
} from "@/types";
import { DEFAULT_CHECKLIST_ITEMS } from "@/types";
import { uid } from "@/lib/utils";

type CreateProjectInput = Omit<
  Project,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "versions"
  | "favorite"
  | "status"
  | "kanbanStage"
  | "kanbanHistory"
  | "kanbanOrder"
  | "priority"
  | "responsible"
  | "platform"
  | "labels"
  | "checklist"
  | "notes"
  | "metrics"
  | "aiAnalysis"
> & {
  status?: ProjectStatus;
  kanbanStage?: KanbanStage;
  priority?: Priority;
  responsible?: string;
  platform?: string;
  labels?: string[];
};

interface ContentState {
  projects: Project[];
  calendarEntries: CalendarEntry[];

  createProject: (input: CreateProjectInput) => Project;
  updateProjectContent: (id: string, content: GeneratedContent, versionLabel?: string) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  toggleFavorite: (id: string) => void;
  restoreVersion: (projectId: string, versionId: string) => void;
  deleteVersion: (projectId: string, versionId: string) => void;
  renameVersion: (projectId: string, versionId: string, label: string) => void;

  moveKanbanStage: (id: string, stage: KanbanStage) => void;
  reorderKanbanColumn: (orderedIds: string[]) => void;

  addCalendarEntry: (entry: Omit<CalendarEntry, "id">) => void;
  updateCalendarEntry: (id: string, patch: Partial<CalendarEntry>) => void;
  removeCalendarEntry: (id: string) => void;
  moveCalendarEntry: (id: string, date: string) => void;
}

function defaultChecklist() {
  return DEFAULT_CHECKLIST_ITEMS.map((text) => ({ id: uid("chk"), text, done: false }));
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      projects: [],
      calendarEntries: [],

      createProject: (input) => {
        const now = new Date().toISOString();
        const stage = input.kanbanStage ?? "escrito";
        const project: Project = {
          id: uid("proj"),
          favorite: false,
          status: input.status ?? "ready",
          createdAt: now,
          updatedAt: now,
          versions: [
            {
              id: uid("ver"),
              label: "Versão original",
              createdAt: now,
              content: input.content,
            },
          ],
          kanbanStage: stage,
          kanbanHistory: [{ stage, at: now }],
          kanbanOrder: Date.now(),
          priority: input.priority ?? "media",
          responsible: input.responsible ?? "",
          platform: input.platform ?? "Instagram",
          labels: input.labels ?? [],
          checklist: defaultChecklist(),
          ...input,
        };
        set((s) => ({ projects: [project, ...s.projects] }));
        return project;
      },

      updateProjectContent: (id, content, versionLabel) => {
        const now = new Date().toISOString();
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  content,
                  updatedAt: now,
                  versions: [
                    ...p.versions,
                    { id: uid("ver"), label: versionLabel ?? `Versão ${p.versions.length + 1}`, createdAt: now, content },
                  ],
                }
              : p
          ),
        }));
      },

      updateProject: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
        }));
      },

      removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      duplicateProject: (id) => {
        const original = get().projects.find((p) => p.id === id);
        if (!original) return;
        const now = new Date().toISOString();
        const copy: Project = {
          ...original,
          id: uid("proj"),
          title: `${original.title} (cópia)`,
          createdAt: now,
          updatedAt: now,
          favorite: false,
          kanbanOrder: Date.now(),
          checklist: original.checklist.map((c) => ({ ...c, id: uid("chk") })),
          metrics: undefined,
          aiAnalysis: undefined,
        };
        set((s) => ({ projects: [copy, ...s.projects] }));
      },

      toggleFavorite: (id) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)) })),

      restoreVersion: (projectId, versionId) => {
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            const version = p.versions.find((v) => v.id === versionId);
            if (!version) return p;
            return { ...p, content: version.content, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      deleteVersion: (projectId, versionId) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, versions: p.versions.filter((v) => v.id !== versionId) } : p
          ),
        }));
      },

      renameVersion: (projectId, versionId, label) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, versions: p.versions.map((v) => (v.id === versionId ? { ...v, label } : v)) }
              : p
          ),
        }));
      },

      moveKanbanStage: (id, stage) => {
        const now = new Date().toISOString();
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  kanbanStage: stage,
                  kanbanOrder: Date.now(),
                  kanbanHistory: [...p.kanbanHistory, { stage, at: now }],
                  updatedAt: now,
                }
              : p
          ),
        }));
      },

      reorderKanbanColumn: (orderedIds) => {
        set((s) => {
          const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
          return {
            projects: s.projects.map((p) => (orderMap.has(p.id) ? { ...p, kanbanOrder: orderMap.get(p.id)! } : p)),
          };
        });
      },

      addCalendarEntry: (entry) => {
        const newEntry: CalendarEntry = { ...entry, id: uid("cal") };
        set((s) => ({ calendarEntries: [...s.calendarEntries, newEntry] }));
      },

      updateCalendarEntry: (id, patch) => {
        set((s) => ({ calendarEntries: s.calendarEntries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
      },

      removeCalendarEntry: (id) => set((s) => ({ calendarEntries: s.calendarEntries.filter((e) => e.id !== id) })),

      moveCalendarEntry: (id, date) => {
        set((s) => ({ calendarEntries: s.calendarEntries.map((e) => (e.id === id ? { ...e, date } : e)) }));
      },
    }),
    {
      name: "hype-content",
      version: 2,
      migrate: (persisted: unknown) => {
        const state = persisted as { projects?: Array<Record<string, unknown>>; calendarEntries?: unknown };
        if (Array.isArray(state?.projects)) {
          state.projects = state.projects.map((p, i) => ({
            kanbanStage: "escrito",
            kanbanHistory: [{ stage: "escrito", at: (p.createdAt as string) ?? new Date().toISOString() }],
            kanbanOrder: Date.now() - i,
            priority: "media",
            responsible: "",
            platform: "Instagram",
            labels: [],
            checklist: defaultChecklist(),
            ...p,
          }));
        }
        return state as unknown as ContentState;
      },
    }
  )
);

export function projectsThisMonth(projects: Project[]): number {
  const now = new Date();
  return projects.filter((p) => {
    const d = new Date(p.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
}

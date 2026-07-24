import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BrandKit, DesignProject, DesignSlide, GeneratedImage, SaveState } from "@/types/design";
import { uid } from "@/lib/utils";

const emptyBrandKit: BrandKit = {
  colors: [],
  fonts: [],
  images: [],
  icons: [],
  references: [],
  rules: "",
};

interface DesignState {
  designs: DesignProject[];
  brandKit: BrandKit;
  generatedImages: GeneratedImage[];
  uploads: string[];
  saveState: SaveState;

  addUpload: (dataUrl: string) => void;
  removeUpload: (dataUrl: string) => void;

  createDesign: (input: Omit<DesignProject, "id" | "createdAt" | "updatedAt" | "versions">) => DesignProject;
  updateDesign: (id: string, patch: Partial<DesignProject>) => void;
  updateSlides: (id: string, slides: DesignSlide[]) => void;
  removeDesign: (id: string) => void;
  duplicateDesign: (id: string) => DesignProject | undefined;

  pushVersion: (id: string, label?: string) => void;
  restoreVersion: (id: string, versionId: string) => void;
  duplicateVersion: (id: string, versionId: string) => void;

  setBrandKit: (patch: Partial<BrandKit>) => void;
  addGeneratedImage: (image: Omit<GeneratedImage, "id" | "createdAt">) => GeneratedImage;
  removeGeneratedImage: (id: string) => void;

  setSaveState: (state: SaveState) => void;

  findByContentProjectId: (contentProjectId: string) => DesignProject | undefined;
}

export const useDesignStore = create<DesignState>()(
  persist(
    (set, get) => ({
      designs: [],
      brandKit: emptyBrandKit,
      generatedImages: [],
      uploads: [],
      saveState: "idle",

      addUpload: (dataUrl) => set((s) => ({ uploads: [dataUrl, ...s.uploads] })),
      removeUpload: (dataUrl) => set((s) => ({ uploads: s.uploads.filter((u) => u !== dataUrl) })),

      createDesign: (input) => {
        const now = new Date().toISOString();
        const design: DesignProject = {
          id: uid("design"),
          createdAt: now,
          updatedAt: now,
          versions: [{ id: uid("dver"), label: "Versão original", createdAt: now, slides: input.slides }],
          ...input,
        };
        set((s) => ({ designs: [design, ...s.designs] }));
        return design;
      },

      updateDesign: (id, patch) => {
        set((s) => ({
          designs: s.designs.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)),
        }));
      },

      updateSlides: (id, slides) => {
        set((s) => ({ designs: s.designs.map((d) => (d.id === id ? { ...d, slides, updatedAt: new Date().toISOString() } : d)) }));
      },

      removeDesign: (id) => set((s) => ({ designs: s.designs.filter((d) => d.id !== id) })),

      duplicateDesign: (id) => {
        const original = get().designs.find((d) => d.id === id);
        if (!original) return undefined;
        const now = new Date().toISOString();
        const copy: DesignProject = { ...original, id: uid("design"), name: `${original.name} (cópia)`, createdAt: now, updatedAt: now };
        set((s) => ({ designs: [copy, ...s.designs] }));
        return copy;
      },

      pushVersion: (id, label) => {
        const design = get().designs.find((d) => d.id === id);
        if (!design) return;
        const now = new Date().toISOString();
        set((s) => ({
          designs: s.designs.map((d) =>
            d.id === id
              ? { ...d, versions: [...d.versions, { id: uid("dver"), label: label ?? `Versão ${d.versions.length + 1}`, createdAt: now, slides: design.slides }] }
              : d
          ),
        }));
      },

      restoreVersion: (id, versionId) => {
        set((s) => ({
          designs: s.designs.map((d) => {
            if (d.id !== id) return d;
            const version = d.versions.find((v) => v.id === versionId);
            if (!version) return d;
            return { ...d, slides: version.slides, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      duplicateVersion: (id, versionId) => {
        set((s) => ({
          designs: s.designs.map((d) => {
            if (d.id !== id) return d;
            const version = d.versions.find((v) => v.id === versionId);
            if (!version) return d;
            const now = new Date().toISOString();
            return { ...d, versions: [...d.versions, { id: uid("dver"), label: `${version.label} (cópia)`, createdAt: now, slides: version.slides }] };
          }),
        }));
      },

      setBrandKit: (patch) => set((s) => ({ brandKit: { ...s.brandKit, ...patch } })),

      addGeneratedImage: (image) => {
        const newImage: GeneratedImage = { ...image, id: uid("img"), createdAt: new Date().toISOString() };
        set((s) => ({ generatedImages: [newImage, ...s.generatedImages] }));
        return newImage;
      },

      removeGeneratedImage: (id) => set((s) => ({ generatedImages: s.generatedImages.filter((i) => i.id !== id) })),

      setSaveState: (state) => set({ saveState: state }),

      findByContentProjectId: (contentProjectId) => get().designs.find((d) => d.contentProjectId === contentProjectId),
    }),
    { name: "hype-design" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BrandProfile } from "@/types";

const emptyProfile: BrandProfile = {
  userName: "",
  brandName: "",
  segment: "",
  offer: "",
  audience: "",
  painPoints: "",
  desires: "",
  objections: "",
  differentiators: "",
  mainGoal: "",
  tone: "",
  frequency: "",
  wordsToUse: "",
  wordsToAvoid: "",
  website: "",
  instagram: "",
  mainCta: "",
  voiceSamples: "",
  description: "",
  onboardingComplete: false,
};

interface BrandState {
  profile: BrandProfile;
  setProfile: (patch: Partial<BrandProfile>) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      profile: emptyProfile,
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      completeOnboarding: () => set((s) => ({ profile: { ...s.profile, onboardingComplete: true } })),
      reset: () => set({ profile: emptyProfile }),
    }),
    { name: "hype-brand" }
  )
);

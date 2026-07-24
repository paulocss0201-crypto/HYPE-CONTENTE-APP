import { useCallback, useRef, useState } from "react";
import type { DesignSlide } from "@/types/design";

const MAX_HISTORY = 40;

function cloneSlides(slides: DesignSlide[]): DesignSlide[] {
  return slides.map((s) => ({ ...s, elements: s.elements.map((e) => ({ ...e })) }));
}

export function useDesignHistory(initial: DesignSlide[]) {
  const [slides, setSlidesState] = useState<DesignSlide[]>(initial);
  const slidesRef = useRef<DesignSlide[]>(initial);
  const past = useRef<DesignSlide[][]>([]);
  const future = useRef<DesignSlide[][]>([]);
  const pendingSnapshot = useRef<DesignSlide[] | null>(null);
  const [historyTick, setHistoryTick] = useState(0);

  const setSlides = useCallback((next: DesignSlide[]) => {
    slidesRef.current = next;
    setSlidesState(next);
  }, []);

  const loadSlides = useCallback((next: DesignSlide[]) => {
    slidesRef.current = next;
    setSlidesState(next);
    past.current = [];
    future.current = [];
    pendingSnapshot.current = null;
    setHistoryTick((t) => t + 1);
  }, []);

  const beginGesture = useCallback(() => {
    if (!pendingSnapshot.current) {
      pendingSnapshot.current = cloneSlides(slidesRef.current);
    }
  }, []);

  const commit = useCallback(() => {
    if (pendingSnapshot.current) {
      past.current.push(pendingSnapshot.current);
      if (past.current.length > MAX_HISTORY) past.current.shift();
      future.current = [];
      pendingSnapshot.current = null;
      setHistoryTick((t) => t + 1);
    }
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(cloneSlides(slidesRef.current));
    setSlides(prev);
    setHistoryTick((t) => t + 1);
  }, [setSlides]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(cloneSlides(slidesRef.current));
    setSlides(next);
    setHistoryTick((t) => t + 1);
  }, [setSlides]);

  return {
    slides,
    setSlides,
    loadSlides,
    beginGesture,
    commit,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    historyTick,
  };
}

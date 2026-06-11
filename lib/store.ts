import { create } from "zustand";

import type { LottieDoc } from "./lottie/model";
import { clearSession, saveSession } from "./persistence";

const HISTORY_LIMIT = 60;
const COALESCE_WINDOW_MS = 900;

export type CanvasBackground = "checker" | "dark" | "light" | "doc";
export type Zoom = number | "fit";

export interface Toast {
  id: number;
  message: string;
  kind: "info" | "error";
}

interface UpdateOptions {
  /** Consecutive updates sharing a key within a short window collapse into
   *  one history entry (e.g. color-picker drags, timeline trims). */
  coalesceKey?: string;
}

interface EditorState {
  doc: LottieDoc | null;
  fileName: string;
  selectedLayer: number | null;

  past: LottieDoc[];
  future: LottieDoc[];
  lastCoalesceKey: string | null;
  lastCommitAt: number;

  isPlaying: boolean;
  currentFrame: number;
  loop: boolean;
  speed: number;

  zoom: Zoom;
  canvasBg: CanvasBackground;

  toasts: Toast[];

  loadDoc: (doc: LottieDoc, fileName: string) => void;
  closeDoc: () => void;
  setFileName: (name: string) => void;
  update: (mutator: (draft: LottieDoc) => void, opts?: UpdateOptions) => void;
  undo: () => void;
  redo: () => void;
  selectLayer: (index: number | null) => void;

  setPlaying: (playing: boolean) => void;
  setCurrentFrame: (frame: number) => void;
  setLoop: (loop: boolean) => void;
  setSpeed: (speed: number) => void;

  setZoom: (zoom: Zoom) => void;
  setCanvasBg: (bg: CanvasBackground) => void;

  toast: (message: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(doc: LottieDoc, fileName: string): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveSession(doc, fileName), 800);
}

export const useEditor = create<EditorState>((set, get) => ({
  doc: null,
  fileName: "animation",
  selectedLayer: null,

  past: [],
  future: [],
  lastCoalesceKey: null,
  lastCommitAt: 0,

  isPlaying: false,
  currentFrame: 0,
  loop: true,
  speed: 1,

  zoom: "fit",
  canvasBg: "checker",

  toasts: [],

  loadDoc: (doc, fileName) => {
    set({
      doc,
      fileName: fileName.replace(/\.(json|lottie)$/i, "") || "animation",
      selectedLayer: null,
      past: [],
      future: [],
      lastCoalesceKey: null,
      isPlaying: true,
      currentFrame: doc.ip,
      zoom: "fit",
    });
    scheduleSave(doc, get().fileName);
  },

  closeDoc: () => {
    clearSession();
    set({
      doc: null,
      fileName: "animation",
      selectedLayer: null,
      past: [],
      future: [],
      lastCoalesceKey: null,
      isPlaying: false,
      currentFrame: 0,
    });
  },

  setFileName: (name) => {
    set({ fileName: name });
    const { doc } = get();
    if (doc) scheduleSave(doc, name);
  },

  update: (mutator, opts) => {
    const {
      doc,
      past,
      lastCoalesceKey,
      lastCommitAt,
      fileName,
      selectedLayer,
    } = get();
    if (!doc) return;
    const next = structuredClone(doc);
    mutator(next);

    const now = Date.now();
    const coalesce =
      !!opts?.coalesceKey &&
      opts.coalesceKey === lastCoalesceKey &&
      now - lastCommitAt < COALESCE_WINDOW_MS;

    set({
      doc: next,
      past: coalesce ? past : [...past.slice(-(HISTORY_LIMIT - 1)), doc],
      future: [],
      lastCoalesceKey: opts?.coalesceKey ?? null,
      lastCommitAt: now,
      selectedLayer:
        selectedLayer !== null && selectedLayer >= next.layers.length
          ? next.layers.length
            ? next.layers.length - 1
            : null
          : selectedLayer,
    });
    scheduleSave(next, fileName);
  },

  undo: () => {
    const { doc, past, future, fileName } = get();
    if (!doc || past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      doc: previous,
      past: past.slice(0, -1),
      future: [doc, ...future].slice(0, HISTORY_LIMIT),
      lastCoalesceKey: null,
      selectedLayer: null,
    });
    scheduleSave(previous, fileName);
  },

  redo: () => {
    const { doc, past, future, fileName } = get();
    if (!doc || future.length === 0) return;
    const [next, ...rest] = future;
    set({
      doc: next,
      past: [...past.slice(-(HISTORY_LIMIT - 1)), doc],
      future: rest,
      lastCoalesceKey: null,
      selectedLayer: null,
    });
    scheduleSave(next, fileName);
  },

  selectLayer: (index) => set({ selectedLayer: index }),

  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentFrame: (currentFrame) => set({ currentFrame }),
  setLoop: (loop) => set({ loop }),
  setSpeed: (speed) => set({ speed }),

  setZoom: (zoom) => set({ zoom }),
  setCanvasBg: (canvasBg) => set({ canvasBg }),

  toast: (message, kind = "info") => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(() => get().dismissToast(id), 4000);
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

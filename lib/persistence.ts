import type { LottieDoc } from "./lottie/model";

const KEY = "lottie-editor:session";
const MAX_BYTES = 4_000_000;

interface SavedSession {
  doc: LottieDoc;
  fileName: string;
}

export function saveSession(doc: LottieDoc, fileName: string): void {
  try {
    const payload = JSON.stringify({ doc, fileName });
    if (payload.length > MAX_BYTES) return;
    localStorage.setItem(KEY, payload);
  } catch {
    // Storage full or unavailable — autosave is best-effort.
  }
}

export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSession;
    if (!parsed?.doc || !Array.isArray(parsed.doc.layers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

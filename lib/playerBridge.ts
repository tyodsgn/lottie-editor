import type { AnimationItem } from "lottie-web";

/** Imperative bridge to the live lottie-web instance.
 *  The canvas registers its AnimationItem here; transport controls and the
 *  timeline call into it directly so scrubbing stays frame-accurate without
 *  routing high-frequency updates through React state. */
let anim: AnimationItem | null = null;

export const playerBridge = {
  register(item: AnimationItem | null): void {
    anim = item;
  },
  get(): AnimationItem | null {
    return anim;
  },
  /** Seek to an absolute document frame. */
  seek(frame: number, keepPlaying: boolean): void {
    if (!anim) return;
    const local = frame - anim.firstFrame;
    const clamped = Math.max(0, Math.min(anim.totalFrames - 0.001, local));
    if (keepPlaying) {
      anim.goToAndPlay(clamped, true);
    } else {
      anim.goToAndStop(clamped, true);
    }
  },
};

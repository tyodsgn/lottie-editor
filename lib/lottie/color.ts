export type RGB = [number, number, number];

/** Normalize a lottie color component array (0..1 floats, but some
 *  exporters emit 0..255 ints) to 0..1 floats. */
export function normalizeComponents(arr: number[]): RGB {
  const [r = 0, g = 0, b = 0] = arr;
  if (r > 1 || g > 1 || b > 1) {
    return [r / 255, g / 255, b / 255];
  }
  return [r, g, b];
}

export function rgbToHex([r, g, b]: RGB): string {
  const to = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function hexToRgb(hex: string): RGB | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

export interface LottieLayer {
  ty: number;
  nm?: string;
  ind?: number;
  parent?: number;
  ip: number;
  op: number;
  st?: number;
  hd?: boolean;
  ks?: Record<string, unknown>;
  shapes?: unknown[];
  refId?: string;
  sc?: string;
  [key: string]: unknown;
}

export interface LottieAsset {
  id?: string;
  layers?: LottieLayer[];
  [key: string]: unknown;
}

export interface LottieDoc {
  v?: string;
  nm?: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  bg?: string;
  layers: LottieLayer[];
  assets?: LottieAsset[];
  [key: string]: unknown;
}

export const LAYER_TYPE_NAMES: Record<number, string> = {
  0: "Precomp",
  1: "Solid",
  2: "Image",
  3: "Null",
  4: "Shape",
  5: "Text",
  6: "Audio",
  13: "Camera",
};

export function layerTypeName(ty: number): string {
  return LAYER_TYPE_NAMES[ty] ?? `Type ${ty}`;
}

export function layerName(layer: LottieLayer, index: number): string {
  return layer.nm?.trim() || `${layerTypeName(layer.ty)} ${index + 1}`;
}

export function docDurationSeconds(doc: LottieDoc): number {
  if (!doc.fr) return 0;
  return (doc.op - doc.ip) / doc.fr;
}

export type ParseResult =
  | { ok: true; doc: LottieDoc }
  | { ok: false; error: string };

export function parseLottie(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "The file is not valid JSON." };
  }
  if (typeof data !== "object" || data === null) {
    return {
      ok: false,
      error: "The file does not contain a Lottie animation.",
    };
  }
  const doc = data as Record<string, unknown>;
  if (!Array.isArray(doc.layers)) {
    return {
      ok: false,
      error: "Missing 'layers' — this doesn't look like a Lottie file.",
    };
  }
  for (const key of ["fr", "ip", "op", "w", "h"]) {
    if (typeof doc[key] !== "number") {
      return {
        ok: false,
        error: `Missing or invalid '${key}' property in the Lottie file.`,
      };
    }
  }
  return { ok: true, doc: doc as unknown as LottieDoc };
}

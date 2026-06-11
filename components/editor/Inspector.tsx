"use client";

import { SlidersHorizontal } from "lucide-react";
import * as React from "react";

import { ColorSwatch, NumberField, Section } from "@/components/editor/fields";
import { type RGB } from "@/lib/lottie/color";
import {
  docDurationSeconds,
  layerName,
  layerTypeName,
} from "@/lib/lottie/model";
import {
  applyColorRef,
  collectDocColors,
  collectLayerColors,
  collectStrokeWidths,
  getLayerTransform,
  paletteGroups,
  setLayerTransform,
  setStrokeWidth,
} from "@/lib/lottie/ops";
import { useEditor } from "@/lib/store";

function DocumentSettings() {
  const doc = useEditor((s) => s.doc)!;
  const update = useEditor((s) => s.update);

  return (
    <>
      <Section title="Document">
        <div className="flex gap-2">
          <NumberField
            label="Width"
            value={doc.w}
            min={1}
            precision={0}
            onCommit={(v) => update((d) => void (d.w = Math.round(v)))}
          />
          <NumberField
            label="Height"
            value={doc.h}
            min={1}
            precision={0}
            onCommit={(v) => update((d) => void (d.h = Math.round(v)))}
          />
        </div>
        <div className="mt-2 flex gap-2">
          <NumberField
            label="Frame rate"
            value={doc.fr}
            min={1}
            max={120}
            onCommit={(v) => update((d) => void (d.fr = v))}
          />
          <NumberField
            label="End frame"
            value={doc.op}
            min={doc.ip + 1}
            precision={0}
            onCommit={(v) => update((d) => void (d.op = Math.round(v)))}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {doc.layers.length} layers · {(doc.op - doc.ip).toFixed(0)} frames ·{" "}
          {docDurationSeconds(doc).toFixed(2)}s
        </p>
      </Section>
      <DocPalette />
    </>
  );
}

function DocPalette() {
  const doc = useEditor((s) => s.doc)!;
  const update = useEditor((s) => s.update);

  const groups = React.useMemo(
    () => paletteGroups(collectDocColors(doc)),
    [doc],
  );

  if (groups.length === 0) return null;

  return (
    <Section title="Palette">
      <p className="mb-1 text-[10px] text-muted-foreground">
        Editing a swatch recolors every use across the document.
      </p>
      {groups.map((group) => (
        <ColorSwatch
          key={group.hex}
          label={
            group.refs.length === 1
              ? group.refs[0].name
              : `${group.refs.length} uses`
          }
          rgb={group.rgb}
          onChange={(rgb: RGB) =>
            update(
              (draft) => {
                for (const ref of group.refs) applyColorRef(draft, ref, rgb);
              },
              { coalesceKey: `palette-${group.hex}` },
            )
          }
        />
      ))}
    </Section>
  );
}

function LayerSettings({ index }: { index: number }) {
  const doc = useEditor((s) => s.doc)!;
  const update = useEditor((s) => s.update);
  const layer = doc.layers[index];

  const transform = React.useMemo(
    () => (layer ? getLayerTransform(layer) : null),
    [layer],
  );
  const colors = React.useMemo(
    () => collectLayerColors(doc, index),
    [doc, index],
  );
  const strokes = React.useMemo(
    () => collectStrokeWidths(doc, index),
    [doc, index],
  );

  if (!layer || !transform) return null;

  const setT = (
    key: Parameters<typeof setLayerTransform>[1],
    value: number | number[],
    coalesceKey: string,
  ) =>
    update((draft) => setLayerTransform(draft.layers[index], key, value), {
      coalesceKey: `${coalesceKey}-${index}`,
    });

  return (
    <>
      <Section title="Layer">
        <div className="text-xs text-foreground">{layerName(layer, index)}</div>
        <div className="mt-0.5 text-[10px] text-muted-foreground">
          {layerTypeName(layer.ty)} · frames {layer.ip.toFixed(0)}–
          {layer.op.toFixed(0)}
        </div>
      </Section>

      <Section title="Transform">
        <div className="flex gap-2">
          <NumberField
            label="X"
            value={transform.position.value[0] ?? 0}
            disabled={transform.position.animated}
            onCommit={(v) =>
              setT("position", [v, transform.position.value[1] ?? 0], "pos")
            }
          />
          <NumberField
            label="Y"
            value={transform.position.value[1] ?? 0}
            disabled={transform.position.animated}
            onCommit={(v) =>
              setT("position", [transform.position.value[0] ?? 0, v], "pos")
            }
          />
        </div>
        <div className="mt-2 flex gap-2">
          <NumberField
            label="Scale X %"
            value={transform.scale.value[0] ?? 100}
            disabled={transform.scale.animated}
            onCommit={(v) =>
              setT("scale", [v, transform.scale.value[1] ?? 100], "scale")
            }
          />
          <NumberField
            label="Scale Y %"
            value={transform.scale.value[1] ?? 100}
            disabled={transform.scale.animated}
            onCommit={(v) =>
              setT("scale", [transform.scale.value[0] ?? 100, v], "scale")
            }
          />
        </div>
        <div className="mt-2 flex gap-2">
          <NumberField
            label="Rotation °"
            value={transform.rotation.value}
            disabled={transform.rotation.animated}
            onCommit={(v) => setT("rotation", v, "rot")}
          />
          <NumberField
            label="Opacity %"
            value={transform.opacity.value}
            min={0}
            max={100}
            disabled={transform.opacity.animated}
            onCommit={(v) => setT("opacity", v, "opacity")}
          />
        </div>
        <div className="mt-2 flex gap-2">
          <NumberField
            label="Anchor X"
            value={transform.anchor.value[0] ?? 0}
            disabled={transform.anchor.animated}
            onCommit={(v) =>
              setT("anchor", [v, transform.anchor.value[1] ?? 0], "anchor")
            }
          />
          <NumberField
            label="Anchor Y"
            value={transform.anchor.value[1] ?? 0}
            disabled={transform.anchor.animated}
            onCommit={(v) =>
              setT("anchor", [transform.anchor.value[0] ?? 0, v], "anchor")
            }
          />
        </div>
        {(transform.position.animated ||
          transform.scale.animated ||
          transform.rotation.animated ||
          transform.opacity.animated) && (
          <p className="mt-2 text-[10px] text-muted-foreground">
            Keyframed properties are shown at their first keyframe and locked.
          </p>
        )}
      </Section>

      {colors.length > 0 && (
        <Section title="Colors">
          {colors.map((ref) => (
            <ColorSwatch
              key={ref.id}
              label={ref.name}
              subtitle={ref.kind}
              rgb={ref.rgb}
              disabled={ref.animated}
              onChange={(rgb) =>
                update((draft) => applyColorRef(draft, ref, rgb), {
                  coalesceKey: `color-${ref.id}`,
                })
              }
            />
          ))}
        </Section>
      )}

      {strokes.length > 0 && (
        <Section title="Stroke width">
          <div className="flex flex-col gap-2">
            {strokes.map((ref) => (
              <div key={ref.id} className="flex items-end gap-2">
                <NumberField
                  label={ref.name}
                  value={ref.value}
                  min={0}
                  step={0.5}
                  disabled={ref.animated}
                  onCommit={(v) =>
                    update((draft) => setStrokeWidth(draft, ref, v), {
                      coalesceKey: `stroke-${ref.id}`,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

export function Inspector() {
  const doc = useEditor((s) => s.doc);
  const selectedLayer = useEditor((s) => s.selectedLayer);
  if (!doc) return null;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <SlidersHorizontal size={13} className="text-muted-foreground" />
        <span className="text-xs font-semibold">
          {selectedLayer === null ? "Document" : "Inspector"}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {selectedLayer === null ? (
          <DocumentSettings />
        ) : (
          <LayerSettings index={selectedLayer} />
        )}
      </div>
    </aside>
  );
}

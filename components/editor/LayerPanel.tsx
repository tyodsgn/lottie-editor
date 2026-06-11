"use client";

import {
  ArrowDown,
  ArrowUp,
  Box,
  Copy,
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  Layers,
  Music,
  Shapes,
  Square,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import * as React from "react";

import { layerName, type LottieLayer } from "@/lib/lottie/model";
import {
  deleteLayer,
  duplicateLayer,
  moveLayer,
  renameLayer,
  toggleLayerVisibility,
} from "@/lib/lottie/ops";
import { useEditor } from "@/lib/store";
import { cn } from "@/lib/utils";

function LayerIcon({ ty }: { ty: number }) {
  const size = 13;
  switch (ty) {
    case 0:
      return <Film size={size} />;
    case 1:
      return <Square size={size} />;
    case 2:
      return <ImageIcon size={size} />;
    case 3:
      return <Box size={size} />;
    case 4:
      return <Shapes size={size} />;
    case 5:
      return <Type size={size} />;
    case 6:
      return <Music size={size} />;
    case 13:
      return <Video size={size} />;
    default:
      return <Layers size={size} />;
  }
}

function LayerRow({
  layer,
  index,
  total,
}: {
  layer: LottieLayer;
  index: number;
  total: number;
}) {
  const selected = useEditor((s) => s.selectedLayer) === index;
  const selectLayer = useEditor((s) => s.selectLayer);
  const update = useEditor((s) => s.update);
  const [editing, setEditing] = React.useState(false);
  const [nameText, setNameText] = React.useState("");

  const name = layerName(layer, index);
  const hidden = layer.hd === true;

  const commitRename = () => {
    setEditing(false);
    const trimmed = nameText.trim();
    if (trimmed && trimmed !== name) {
      update((draft) => renameLayer(draft, index, trimmed));
    }
  };

  return (
    <div
      className={cn(
        "group flex h-8 cursor-pointer select-none items-center gap-1.5 border-b border-border/50 px-2 text-xs transition-colors",
        selected ? "bg-primary/15 text-foreground" : "hover:bg-accent/60",
        hidden && "opacity-50",
      )}
      onClick={() => selectLayer(selected ? null : index)}
      onDoubleClick={() => {
        setNameText(name);
        setEditing(true);
      }}
    >
      <button
        type="button"
        title={hidden ? "Show layer" : "Hide layer"}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          update((draft) => toggleLayerVisibility(draft, index));
        }}
      >
        {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
      <span
        className={cn(
          "shrink-0",
          selected ? "text-primary" : "text-muted-foreground",
        )}
      >
        <LayerIcon ty={layer.ty} />
      </span>

      {editing ? (
        <input
          autoFocus
          className="h-5 min-w-0 flex-1 rounded border border-input bg-background px-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={nameText}
          onChange={(e) => setNameText(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <span
          className="min-w-0 flex-1 truncate"
          title={`${name} — double-click to rename`}
        >
          {name}
        </span>
      )}

      <div
        className={cn(
          "hidden shrink-0 items-center gap-0.5 group-hover:flex",
          selected && "flex",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          title="Move up"
          disabled={index === 0}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
          onClick={() => update((draft) => moveLayer(draft, index, index - 1))}
        >
          <ArrowUp size={12} />
        </button>
        <button
          type="button"
          title="Move down"
          disabled={index === total - 1}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
          onClick={() => update((draft) => moveLayer(draft, index, index + 1))}
        >
          <ArrowDown size={12} />
        </button>
        <button
          type="button"
          title="Duplicate layer"
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={() => update((draft) => duplicateLayer(draft, index))}
        >
          <Copy size={12} />
        </button>
        <button
          type="button"
          title="Delete layer"
          className="rounded p-0.5 text-muted-foreground hover:text-destructive"
          onClick={() => update((draft) => deleteLayer(draft, index))}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export function LayerPanel() {
  const doc = useEditor((s) => s.doc);
  if (!doc) return null;

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <Layers size={13} className="text-muted-foreground" />
        <span className="text-xs font-semibold">Layers</span>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
          {doc.layers.length}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {doc.layers.length === 0 ? (
          <p className="p-4 text-center text-xs text-muted-foreground">
            No layers
          </p>
        ) : (
          doc.layers.map((layer, i) => (
            <LayerRow
              key={`${layer.ind ?? "x"}-${i}`}
              layer={layer}
              index={i}
              total={doc.layers.length}
            />
          ))
        )}
      </div>
    </aside>
  );
}

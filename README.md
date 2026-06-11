# Lottie Editor

A browser-based [Lottie animation](https://lottie.github.io/) editor — inspect, restyle, retime and export Lottie files without leaving the page.

## Features

**Import**

- Drag & drop a `.json` anywhere, browse files, load from a URL, or try the bundled example
- Validation with friendly errors; sessions are autosaved and restored on reload

**Edit**

- Layer panel: select, rename (double-click), show/hide, reorder, duplicate and delete layers
- Inspector: document size, frame rate and duration; per-layer transform (position, scale, rotation, opacity, anchor) for non-keyframed properties
- Colors: edit fills, strokes, gradient stops and solid layers — including layers nested inside precomps; the document **palette** recolors every use of a color at once
- Stroke width editing
- Full undo/redo history

**Timeline**

- Frame ruler with scrubbing playhead, play/pause, loop and playback speed
- Per-layer bars: drag to shift a layer in time, drag the edges to trim in/out points
- Keyframe markers extracted from every animated property

**Export**

- Pretty or minified Lottie JSON, dotLottie (`.lottie`), or copy JSON to the clipboard

**Keyboard shortcuts**

| Keys                | Action                   |
| ------------------- | ------------------------ |
| `Space`             | Play / pause             |
| `←` / `→` (`⇧` ×10) | Step frames              |
| `⌘Z` / `⇧⌘Z`        | Undo / redo              |
| `⌘D`                | Duplicate selected layer |
| `⌫`                 | Delete selected layer    |
| `Esc`               | Deselect                 |

## Architecture

- **Next.js 14 + TypeScript + Tailwind** — single-page client app
- **zustand** store with snapshot-based undo/redo (`lib/store.ts`)
- Pure Lottie-document operations in `lib/lottie/` (parsing, color collection, transforms, keyframes, layer ops)
- **lottie-web** drives the canvas directly via an imperative bridge (`lib/playerBridge.ts`) so scrubbing stays frame-accurate
- Editor UI in `components/editor/` (top bar, layer panel, canvas stage, inspector, timeline)

## Development

```bash
npm install
npm run dev   # http://localhost:3000
npm run build
npm run lint
```

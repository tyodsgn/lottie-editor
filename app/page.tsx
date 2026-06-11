"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@/components/editor/Editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading editor…
      </div>
    ),
  },
);

export default function Home() {
  return <Editor />;
}

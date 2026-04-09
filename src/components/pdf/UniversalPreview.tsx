"use client";

import React from "react";

interface UniversalPreviewProps {
  title: string;
  description: string;
  mode?: "grid" | "vertical";
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

export default function UniversalPreview({
  title,
  description,
  mode = "vertical",
  children,
  rightAction,
}: UniversalPreviewProps) {
  return (
    <div className="w-full max-w-none mx-auto rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col min-h-[450px] lg:min-h-[550px] max-h-[85vh] overflow-hidden">
      {/* Header section consistent across all tools */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
          <p className="text-xs text-white/40">{description}</p>
        </div>
        {rightAction && <div className="flex gap-2">{rightAction}</div>}
      </div>

      {/* Content wrapper */}
      <div
        className={`flex-1 overflow-y-auto custom-scrollbar p-2 ${
          mode === "grid"
            ? "flex" // Rely on child to render DndContext / grid container
            : "flex flex-col items-center gap-8 py-6 rounded-xl bg-black/20 inset-shadow-sm" // Document view layout
        }`}
      >
        {children}
      </div>
    </div>
  );
}

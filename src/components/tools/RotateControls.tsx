"use client";

import { useState } from "react";
import { rotatePdf } from "@/lib/pdf/rotate";
import type { ToolControlsProps } from "./types";
import { RotateCw, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";
import SecurityModal from "../pdf/SecurityModal";
import { getProtectedFiles } from "@/lib/pdf/validation";

export default function RotateControls({
  files,
  setFiles,
  setProcessing,
  processing,
  setProgress,
  setResultBlob,
  setResultFileName,
  setError,
}: ToolControlsProps) {
  const file = files[0]?.file || null;
  const { pages, totalPages, loading, error: loadError, isProtected } = usePdfLoader(file, true, 100);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  // Maps pageNum (1-indexed) to accumulated rotation (0, 90, 180, 270)
  const [rotations, setRotations] = useState<Record<number, number>>({});

  const rotatePage = (pageNum: number) => {
    setRotations(prev => {
      const current = prev[pageNum] || 0;
      return { ...prev, [pageNum]: (current + 90) % 360 };
    });
  };

  const handleRotateAll = () => {
    setRotations(prev => {
      const next: Record<number, number> = {};
      pages.forEach(p => {
        const current = prev[p.pageNum] || 0;
        next[p.pageNum] = (current + 90) % 360;
      });
      return next;
    });
  };

  const clearAll = () => {
    setRotations({});
  };

  const handleApply = async () => {
    if (!file) return;

    // Proactive check
    const encrypted = await getProtectedFiles([file]);
    if (encrypted.length > 0) {
      setSecurityModalOpen(true);
      return;
    }

    // Check if any rotations actually exist
    const hasActiveRotations = Object.values(rotations).some(angle => angle > 0);
    if (!hasActiveRotations) {
      setError("No rotations have been applied. Please rotate at least one page.");
      return;
    }

    try {
      setProcessing(true);
      setProgress(20);
      setError(null);

      // Convert 1-indexed state map to 0-indexed API map
      const apiMap: Record<number, number> = {};
      Object.entries(rotations).forEach(([pageNum, angle]) => {
        if (angle > 0) {
          apiMap[parseInt(pageNum, 10) - 1] = angle;
        }
      });

      const result = await rotatePdf(file, apiMap);
      setProgress(90);

      const blob = new Blob([result as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setResultFileName(`${baseName} - Rotate PDF - PDFly by Murtuja.pdf`);
      setProgress(100);
    } catch (err) {
      setError(`Failed to rotate: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSecurityConfirm = () => {
    setSecurityModalOpen(false);
    setFiles([]);
  };

  if (!file) return null;

  return (
    <ToolLayout
      preview={
        <UniversalPreview
          title="Interactive Page Rotation"
          description={`${totalPages} pages total. Click the rotate icon on individual pages.`}
          mode="grid"
          rightAction={
            <div className="flex gap-2">
              <button
                onClick={handleRotateAll}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" /> Rotate All Right
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1.5 text-xs text-white/40 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>
          }
        >
          {loadError ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center w-full col-span-full">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Password Protected</h3>
              <p className="text-white/40 max-w-sm mb-6">
                This file is encrypted and cannot be rotated. Please remove the password first.
              </p>
              <Link href="/tool/unlock-pdf" className="btn btn-secondary text-sm">
                Go to Unlock Tool
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full pb-4 items-start">
              {pages.map((p) => {
                const rotation = rotations[p.pageNum] || 0;
                return (
                  <div key={p.pageNum} className="relative group flex flex-col items-center">
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-md flex items-center justify-center p-2 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNum}`}
                        className="max-w-full max-h-full object-contain bg-white shadow-sm transition-transform duration-300"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      />
                      <button
                        onClick={() => rotatePage(p.pageNum)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <div className="bg-purple-500 hover:bg-purple-400 text-white p-3 rounded-full shadow-lg transform transition-transform hover:scale-110 active:scale-95">
                          <RotateCw className="w-5 h-5" />
                        </div>
                      </button>
                    </div>
                    <div className="text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
                      Page {p.pageNum}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="aspect-[3/4] rounded-xl border border-white/5 bg-white/5 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  <span className="text-xs text-white/40">Rendering...</span>
                </div>
              )}
            </div>
          )}
        </UniversalPreview>
      }
      options={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h3 className="text-sm font-medium text-white mb-1">Apply Rotation</h3>
          <p className="text-xs text-white/40 leading-relaxed">Saves the modified document with permanent rotations. Use the rotate icons on individual pages or the bulk actions in the preview header.</p>
        </div>
      }
      action={
        <div className="w-full">
          <SecurityModal
            isOpen={securityModalOpen}
            onClose={() => setSecurityModalOpen(false)}
            onConfirm={handleSecurityConfirm}
            protectedFiles={[file!]}
          />
          <button
            onClick={handleApply}
            disabled={processing || !!loadError || Object.values(rotations).every(r => r === 0)}
            className="btn btn-primary w-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCw className="w-5 h-5" />}
            {processing ? "Applying..." : "Apply Changes"}
          </button>
        </div>
      }
    />
  );
}

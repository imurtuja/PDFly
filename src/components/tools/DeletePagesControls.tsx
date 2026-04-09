"use client";

import { useState } from "react";
import { deletePages } from "@/lib/pdf/delete-pages";
import type { ToolControlsProps } from "./types";
import { Trash2, Loader2, CheckCircle2, Lock, File as FileIcon } from "lucide-react";
import Link from "next/link";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";
import SecurityModal from "../pdf/SecurityModal";
import { getProtectedFiles } from "@/lib/pdf/validation";

import { useRouter } from "next/navigation";
import { fileTransfer } from "@/lib/file-transfer";

export default function DeletePagesControls({
  files,
  setFiles,
  setProcessing,
  processing,
  setProgress,
  setResultBlob,
  setResultFileName,
  setError,
}: ToolControlsProps) {
  const router = useRouter();
  const file = files[0]?.file || null;
  // Load ALL pages for delete tools so user can see every single one
  const { pages, totalPages, loading, error: loadError, isProtected } = usePdfLoader(file, true, 100);

  const handleGoToUnlock = () => {
    if (file) {
      fileTransfer.setPendingFiles([file]);
      router.push("/tool/unlock-pdf");
    }
  };
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (num: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!file) return;
    try {
      setProcessing(true); setProgress(10); setError(null);
      // Convert 1-indexed UI selection to 0-indexed for the library
      const pagesToDelete = Array.from(selected).map(n => n - 1);
      const result = await deletePages(file, pagesToDelete);
      setProgress(90);
      setResultBlob(new Blob([result as unknown as BlobPart], { type: "application/pdf" }));
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setResultFileName(`${baseName} - Delete Pages - PDFly by Murtuja.pdf`);
      setProgress(100);
    } catch (err) {
      setError(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setProcessing(false); }
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
          title="Select Pages to Delete"
          description={`${totalPages} pages total · ${selected.size > 0 ? selected.size + " selected for deletion" : "Click pages to select"}`}
          mode="grid"
          rightAction={
            selected.size > 0 && (
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs text-white/40 hover:text-white transition-colors"
              >
                Clear Selection
              </button>
            )
          }
        >
          {loadError && isProtected ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center w-full">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl animate-pulse" />
                <div className="relative w-24 h-24 rounded-3xl bg-black flex items-center justify-center border border-red-500/20 shadow-2xl">
                  <Lock className="w-10 h-10 text-red-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Protected Document</h3>
              <p className="text-white/40 max-w-sm mb-8 text-sm leading-relaxed">
                This PDF is encrypted and cannot be modified here. Unlock it to continue.
              </p>
              <button 
                onClick={handleGoToUnlock} 
                className="px-8 py-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all font-bold text-sm shadow-xl flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Unlock This PDF
              </button>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center w-full">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4 text-red-400">
                <FileIcon className="w-8 h-8" />
              </div>
              <p className="text-white/40 max-w-sm font-medium">{loadError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-4 w-full">
              {pages.map((p) => {
                const isSelected = selected.has(p.pageNum);
                return (
                  <button
                    key={p.pageNum}
                    onClick={() => toggle(p.pageNum)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-200 group ${isSelected
                        ? "border-red-500 scale-95 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        : "border-transparent bg-white/5 hover:border-white/20 hover:scale-[1.02] shadow-md"
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="w-full h-full object-contain bg-white" />

                    {!isSelected && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-red-500/90 text-white rounded-full p-2 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          <Trash2 className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-red-500 text-white rounded-full p-2 mb-2 shadow-lg">
                          <Trash2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-white bg-black/60 px-2 py-1 rounded">Will Delete</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white">
                      {p.pageNum}
                    </div>
                  </button>
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
          <h3 className="text-sm font-medium text-white mb-1">Remove Pages</h3>
          <p className="text-xs text-white/40 leading-relaxed">This action will create a new PDF without the selected pages. Click on the pages in the live preview to select or deselect them for deletion.</p>
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
            onClick={handleDelete}
            disabled={selected.size === 0 || processing || !!loadError}
            className="btn btn-primary w-full shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-red-600 hover:bg-red-500 border-red-500/50"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            {processing ? "Filtering..." : `Delete ${selected.size} Page${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      }
    />
  );
}

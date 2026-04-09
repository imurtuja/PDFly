"use client";

import { useState } from "react";
import type { ToolControlsProps } from "./types";
import { Image as ImageIcon, Loader2, Archive, Lock } from "lucide-react";
import Link from "next/link";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";
import SecurityModal from "../pdf/SecurityModal";
import { getProtectedFiles } from "@/lib/pdf/validation";

export default function PdfToImageControls({
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
  const { pages, totalPages, loading, error: loadError, isProtected } = usePdfLoader(file, true, 300);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const [exportMode, setExportMode] = useState<"separate" | "combined">("separate");

  const handleConvert = async () => {
    if (!file) return;

    // Proactive check
    const encrypted = await getProtectedFiles([file]);
    if (encrypted.length > 0) {
      setSecurityModalOpen(true);
      return;
    }

    try {
      setProcessing(true); setProgress(10); setError(null);
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const bytes = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const numPages = pdfDoc.numPages;
      setProgress(20);
      const allCanvases: HTMLCanvasElement[] = [];
      let totalH = 0, maxW = 0;
      for (let i = 1; i <= Math.min(numPages, 20); i++) { // cap at 20 pages for perf
        const p = await pdfDoc.getPage(i);
        const vp = p.getViewport({ scale: 2 });
        const c = document.createElement("canvas");
        c.width = vp.width; c.height = vp.height;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await p.render({ canvasContext: c.getContext("2d")!, viewport: vp, canvas: c } as any).promise;
        allCanvases.push(c);
        totalH += vp.height; maxW = Math.max(maxW, vp.width);
        setProgress(20 + Math.round((i / numPages) * 60));
      }

      const baseName = file.name.replace(/\.[^/.]+$/, "");

      if (exportMode === "combined") {
        const merged = document.createElement("canvas");
        merged.width = maxW; merged.height = totalH;
        const ctx = merged.getContext("2d")!;
        let y = 0;
        for (const c of allCanvases) { ctx.drawImage(c, 0, y); y += c.height; }
        const blob = await new Promise<Blob>((r) => merged.toBlob((b) => r(b!), "image/png"));
        setResultBlob(blob);
        setResultFileName(`${baseName} - PDF to Image - PDFly by Murtuja.png`);
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        for (let i = 0; i < allCanvases.length; i++) {
          const blob = await new Promise<Blob>((r) => allCanvases[i].toBlob((b) => r(b!), "image/png"));
          zip.file(`${baseName}_page_${i + 1}.png`, blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setResultBlob(zipBlob);
        setResultFileName(`${baseName} - PDF to Images - PDFly by Murtuja.zip`);
      }
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
          title="Document Preview"
          description={`${totalPages} pages total. Converting top 20 pages max.`}
          mode="grid"
        >
          <div className="w-full h-full min-h-0">
            {loadError ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center w-full col-span-full">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4">
                  <Lock className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Password Protected</h3>
                <p className="text-white/40 max-w-sm mb-6">
                  This file is encrypted and cannot be converted. Please remove the password first.
                </p>
                <Link href="/tool/unlock-pdf" className="btn btn-secondary text-sm">
                  Go to Unlock Tool
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 w-full content-start">
                {pages.map((p) => (
                  <div key={p.pageNum} className="relative aspect-[1/1.414] bg-white rounded-lg shadow-sm border overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <span className="text-[10px] sm:text-xs text-white font-medium">{p.pageNum}</span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="aspect-[1/1.414] rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    <span className="text-[10px] text-white/40">Loading...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </UniversalPreview>
      }
      options={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-white mb-1">Export Mode</h3>
            <p className="text-xs text-white/40 mb-3">Choose how you want to save the images.</p>
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setExportMode("separate")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${exportMode === "separate" ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20" : "text-white/40 hover:text-white/70"
                  }`}
              >
                <Archive className="w-3.5 h-3.5" /> ZIP Archive
              </button>
              <button
                onClick={() => setExportMode("combined")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${exportMode === "combined" ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20" : "text-white/40 hover:text-white/70"
                  }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Long Image
              </button>
            </div>
            <p className="text-[10px] text-white/30 mt-2 px-1">
              {exportMode === "separate"
                ? "Downloads a .zip folder containing individual high-quality images."
                : "Creates a single continuous image containing all pages sequentially."}
            </p>
          </div>
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
            onClick={handleConvert}
            disabled={processing || loading || !!loadError}
            className="btn btn-primary w-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            {processing ? "Converting..." : "Convert to Images"}
          </button>
        </div>
      }
    />
  );
}

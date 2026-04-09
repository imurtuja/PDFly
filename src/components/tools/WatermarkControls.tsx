"use client";

import { useState } from "react";
import { addWatermark, type WatermarkOptions } from "@/lib/pdf/watermark";
import type { ToolControlsProps } from "./types";
import { Droplets, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";
import SecurityModal from "../pdf/SecurityModal";
import { getProtectedFiles } from "@/lib/pdf/validation";

export default function WatermarkControls({
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
  const { pages, totalPages, loading, error: loadError, isProtected } = usePdfLoader(file, true, 20); // Load 20 pages max for preview
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const [text, setText] = useState("PDFly by Murtuja");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-45);
  const [position, setPosition] = useState<WatermarkOptions["position"]>("center");
  const [fitToPage, setFitToPage] = useState(false);

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;

    // Proactive check
    const encrypted = await getProtectedFiles([file]);
    if (encrypted.length > 0) {
      setSecurityModalOpen(true);
      return;
    }

    try {
      setProcessing(true); setProgress(20); setError(null);
      const result = await addWatermark(file, {
        text: text.trim(),
        fontSize,
        opacity,
        rotation,
        position,
        fitToPage
      });
      setProgress(90);
      setResultBlob(new Blob([result as unknown as BlobPart], { type: "application/pdf" }));
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setResultFileName(`${baseName} - Watermarked - PDFly by Murtuja.pdf`); setProgress(100);
    } catch (err) {
      setError(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setProcessing(false); }
  };

  const handleSecurityConfirm = () => {
    setSecurityModalOpen(false);
    setFiles([]);
  };

  if (!file) return null;

  // Helper for live preview positioning
  const getPreviewStyle = () => {
    const style: React.CSSProperties = {
      position: "absolute",
      opacity: opacity,
      color: "gray",
      fontWeight: "bold",
      transform: `rotate(${rotation}deg)`,
      transformOrigin: "center",
      whiteSpace: "nowrap",
      pointerEvents: "none"
    };

    if (position === "center") {
      style.top = "50%";
      style.left = "50%";
      style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    } else if (position === "topLeft") {
      style.top = "10%";
      style.left = "10%";
      style.transformOrigin = "top left";
    } else if (position === "topRight") {
      style.top = "10%";
      style.right = "10%";
      style.transformOrigin = "top right";
    } else if (position === "bottomLeft") {
      style.bottom = "10%";
      style.left = "10%";
      style.transformOrigin = "bottom left";
    } else if (position === "bottomRight") {
      style.bottom = "10%";
      style.right = "10%";
      style.transformOrigin = "bottom right";
    }

    // Mathematical scale matching: A4 is 595pts wide. 
    // Container width dynamically scales, so we bind font-size purely to its container context 
    // to guarantee 100% geometric scale parity with PDF-lib backend execution.
    if (fitToPage) {
      // Backend uses 80% diagonal sizing
      const isDiagonal = (Math.abs(rotation) % 90) !== 0;
      const targetWidthRatio = isDiagonal ? 0.8 * 1.732 : 0.8; // 1.732 is diag for A4 aspect

      // Approximation of font width to em
      const charWidthAvg = 0.6;
      const textWidthEms = Math.max(text.length, 1) * charWidthAvg;

      const scaleCqi = (targetWidthRatio / textWidthEms) * 100;

      // Backend caps at 300 pts -> 300/595 = 50.4%
      style.fontSize = `${Math.min(scaleCqi, 50)}cqi`;
    } else {
      // Absolute exact scaling based on backend standard 595pts width box
      const scaleCqi = (fontSize / 595) * 100;
      style.fontSize = `${scaleCqi}cqi`;
    }

    return style;
  };

  return (
    <ToolLayout
      preview={
        <UniversalPreview
          title="Live Document Preview"
          description={`${totalPages} pages total. Watermark is applied globally.`}
          mode="grid"
        >
          {loadError ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center w-full col-span-full">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Password Protected</h3>
              <p className="text-white/40 max-w-sm mb-6">
                This file is encrypted and cannot be watermarked. Please remove the password first.
              </p>
              <Link href="/tool/unlock-pdf" className="btn btn-secondary text-sm">
                Go to Unlock Tool
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-4 w-full content-start items-start">
              {pages.map((p) => (
                <div
                  key={p.pageNum}
                  className="relative w-full rounded-xl border border-white/10 bg-white/5 shadow-md flex items-center justify-center overflow-hidden self-start"
                >
                  <div className="relative w-full h-full flex flex-col" style={{ containerType: 'inline-size' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="w-full h-auto block pointer-events-none" />
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div style={getPreviewStyle()}>
                        {text}
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/60 shadow-md px-2 py-0.5 rounded text-[10px] text-white pointer-events-none z-10">
                    {p.pageNum}
                  </div>
                </div>
              ))}
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-8">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">Watermark Configuration</h3>
            <p className="text-xs text-white/40 mb-6">Customize your watermark text and styling.</p>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Text Payload</label>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner text-sm"
                  placeholder="CONFIDENTIAL" />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Font Size</span>
                  <span className="text-white/60">{fontSize}px</span>
                </label>
                <input type="range" min={12} max={160} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}
                  disabled={fitToPage}
                  className="w-full accent-purple-500 disabled:opacity-30" />

                <label className="flex items-center gap-3 cursor-pointer group mt-4">
                  <input
                    type="checkbox"
                    checked={fitToPage}
                    onChange={(e) => setFitToPage(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-purple-500 focus:ring-purple-500/50 bg-black/40"
                  />
                  <span className="text-sm text-white/80 group-hover:text-white transition-colors">Fit to Page Width</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Opacity</span>
                  <span className="text-white/60">{Math.round(opacity * 100)}%</span>
                </label>
                <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Rotation</span>
                  <span className="text-white/60">{rotation}°</span>
                </label>
                <input type="range" min={0} max={360} step={15} value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 block">Position Alignment</label>
            <div className="grid grid-cols-3 grid-rows-3 gap-2 aspect-square w-full max-w-[200px] mx-auto bg-black/40 p-3 rounded-xl border border-white/10">
              {(["topLeft", "top", "topRight", "left", "center", "right", "bottomLeft", "bottom", "bottomRight"] as const).map(pos => {
                const isSupported = ["topLeft", "topRight", "center", "bottomLeft", "bottomRight"].includes(pos);
                const isSelected = position === pos;
                return (
                  <button
                    key={pos}
                    disabled={!isSupported}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={() => setPosition(pos as any)}
                    className={`rounded-lg transition-all ${isSelected
                        ? "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                        : isSupported
                          ? "bg-white/5 hover:bg-white/15"
                          : "bg-transparent cursor-not-allowed"
                      }`}
                    aria-label={`Position ${pos}`}
                  />
                );
              })}
            </div>
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
            onClick={handleWatermark}
            disabled={!text.trim() || processing || !!loadError}
            className="btn btn-primary w-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Droplets className="w-5 h-5" />}
            {processing ? "Applying..." : "Stamp PDF"}
          </button>
        </div>
      }
    />
  );
}

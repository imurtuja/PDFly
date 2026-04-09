import { useState, useRef, useEffect } from "react";
import type { ToolControlsProps } from "./types";
import { Minimize2, Loader2, Gauge, XCircle, AlertTriangle, Eye, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";
import SecurityModal from "../pdf/SecurityModal";
import { getProtectedFiles } from "@/lib/pdf/validation";
import { processClientCompression, generateCompressionPreview } from "@/lib/pdf/compress";

type Mode = "targetSize" | "preset";
type PresetQuality = "low" | "medium" | "high";

const presets: { value: PresetQuality; label: string; desc: string }[] = [
  { value: "high", label: "High Quality", desc: "Rasterized PNG (max clarity, may increase size)" },
  { value: "medium", label: "Balanced", desc: "JPEG 1.5x (sharp text, good compression)" },
  { value: "low", label: "Maximum Shrink", desc: "JPEG 1.2x (compressed, useful for email)" },
];

export default function CompressControls({
  files, setFiles, setProcessing, processing, progress, setProgress, setResultBlob, setResultFileName, setError,
}: ToolControlsProps) {
  const file = files[0]?.file || null;
  const { pages, totalPages, loading, error: loadError, isProtected } = usePdfLoader(file, true, 20);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const [mode, setMode] = useState<Mode>("targetSize");
  const [targetSizeKB, setTargetSizeKB] = useState("1024"); // 1MB default
  const [preset, setPreset] = useState<PresetQuality>("medium");
  const [statusMessage, setStatusMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  const isCancelled = useRef(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Smart Preview Logic: Update preview when settings change
  useEffect(() => {
    if (!file || processing) return;

    const updatePreview = async () => {
        setPreviewLoading(true);
        try {
            let scale = 1.5;
            let quality = 0.85;
            let format: 'image/jpeg' | 'image/png' = 'image/jpeg';

            if (mode === 'preset') {
                if (preset === 'high') { scale = 2.0; quality = 1.0; format = 'image/png'; }
                else if (preset === 'low') { scale = 1.2; quality = 0.7; format = 'image/jpeg'; }
            } else {
                // Approximate first pass of target mode
                scale = 2.0; 
                quality = 0.95;
            }

            const dataUrl = await generateCompressionPreview(file, scale, quality, format);
            setPreviewUrl(dataUrl);
        } catch (e) {
            console.warn("Preview failed", e);
        } finally {
            setPreviewLoading(false);
        }
    };

    const timer = setTimeout(updatePreview, 500); // Throttled
    return () => clearTimeout(timer);
  }, [file, mode, preset, processing]);

  const handleCompress = async () => {
    if (!file) return;

    // Proactive check
    const encrypted = await getProtectedFiles([file]);
    if (encrypted.length > 0) {
      setSecurityModalOpen(true);
      return;
    }

    try {
      setProcessing(true);
      setProgress(0);
      setError(null);
      setStatusMessage("Starting engine...");
      isCancelled.current = false;

      const blob = await processClientCompression(file, {
        mode,
        preset,
        targetSizeKB: parseInt(targetSizeKB) || 1024,
        onProgress: (p) => {
          setStatusMessage(p.message);
          setProgress(p.percent);
        },
        shouldCancel: () => isCancelled.current
      });

      if (isCancelled.current) return;

      setResultBlob(blob);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setResultFileName(`${baseName} - Compressed - PDFly by Murtuja.pdf`);

      setStatusMessage(`Complete! Reduced by ${((1 - blob.size / file.size) * 100).toFixed(0)}%`);
      setProgress(100);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Compilation cancelled by user" || error.message === "Cancelled by user") {
        setStatusMessage("Task aborted.");
        setProgress(0);
      } else {
        setError(`Processing Error: ${err instanceof Error ? err.message : "Internal error"}`);
      }
    } finally {
      if (!isCancelled.current) {
        setProcessing(false);
      }
    }
  };

  const cancelCompression = () => {
    isCancelled.current = true;
    setProcessing(false);
    setStatusMessage("Aborting loop...");
  };

  const handleSecurityConfirm = () => {
    setSecurityModalOpen(false);
    setFiles([]);
  };

  if (!file) return null;

  return (
    <ToolLayout
      preview={
        <div className="space-y-4">
          {/* Quality Warning Banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <p className="font-bold mb-1 tracking-wide">QUALITY NOTICE</p>
              <p className="opacity-70">
                Text in compressed PDFs is rasterized.
                <span className="text-white font-medium"> Balanced</span> or
                <span className="text-white font-medium"> High Quality</span> is recommended for documents with small text.
                {preset === 'high' && <span className="block mt-1 font-semibold text-fuchsia-400 italic">Note: High Quality uses PNG and may result in a larger file size.</span>}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <UniversalPreview
              title="Input Document"
              description={`${totalPages} pages • ${formatSize(file.size)}`}
              mode="grid"
            >
              {loadError ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center w-full col-span-full">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4">
                    <Lock className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Password Protected</h3>
                  <p className="text-white/40 max-w-sm mb-6">
                    This file is encrypted and cannot be compressed. Please remove the password first.
                  </p>
                  <Link href="/tool/unlock-pdf" className="btn btn-secondary text-sm">
                    Go to Unlock Tool
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2 w-full">
                  {pages.slice(0, 4).map((p) => (
                    <div key={p.pageNum} className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-white/5">
                      <img src={p.dataUrl} alt="Page" className="w-full h-full object-contain" />
                    </div>
                  ))}
                  {totalPages > 4 && <div className="aspect-[3/4] flex items-center justify-center bg-white/5 text-[10px] text-white/40">+{totalPages - 4} more</div>}
                </div>
              )}
            </UniversalPreview>

            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Eye className="w-3 h-3 text-purple-400" /> Quick Preview
                  </h4>
                  <p className="text-[10px] text-white/40">Compressed output quality (Page 1)</p>
                </div>
              </div>
              <div className="flex-1 bg-black/40 relative flex items-center justify-center p-6 min-h-[300px]">
                {previewLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                    <span className="text-[10px] text-white/40">Simulating quality...</span>
                  </div>
                ) : !!loadError ? (
                  <div className="flex flex-col items-center gap-2 text-center opacity-20">
                    <Lock className="w-8 h-8 text-white mb-2" />
                    <span className="text-[10px] text-white uppercase tracking-widest font-bold">Locked</span>
                  </div>
                ) : previewUrl ? (
                  <div className="relative group w-full h-full flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-full shadow-2xl rounded-sm bg-white" />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white/80 font-medium text-center italic">Visual clarity at current settings</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-white/20">Select a file to see preview</span>
                )}
              </div>
            </div>
          </div>
        </div>
      }
      options={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Compression Strategy</h3>
            <div className="flex bg-black/40 rounded-xl p-1.5 border border-white/5">
              <button
                onClick={() => setMode("targetSize")}
                disabled={processing}
                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${mode === "targetSize" ? "bg-purple-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                  } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Target File Size
              </button>
              <button
                onClick={() => setMode("preset")}
                disabled={processing}
                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${mode === "preset" ? "bg-purple-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                  } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Intelligent Presets
              </button>
            </div>
          </div>

          {mode === "targetSize" ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-3">
                  Approximate Goal Size
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={10}
                    disabled={processing}
                    value={targetSizeKB}
                    onChange={(e) => setTargetSizeKB(e.target.value)}
                    className="w-full pl-4 pr-16 py-4 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-lg focus:outline-none focus:border-purple-500 transition-all disabled:opacity-50"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">
                    KB
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-white/30 flex items-start gap-2 leading-relaxed bg-white/5 p-3 rounded-lg">
                <Gauge className="w-3.5 h-3.5 shrink-0 text-purple-500" /> The engine will perform up to 6 passes, adjusting quality then resolution to reach {formatSize((parseInt(targetSizeKB) || 0) * 1024)}.
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                Predictive Presets
              </label>
              {presets.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setPreset(o.value)}
                  disabled={processing}
                  className={`w-full group flex flex-col items-start p-4 rounded-xl text-left transition-all border ${preset === o.value
                    ? "border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                    : "border-white/10 bg-black/20 hover:bg-black/40 hover:border-white/20"
                    } ${processing ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${preset === o.value ? "border-purple-500 bg-purple-500 scale-110 shadow-[0_0_10px_rgba(168,85,247,1)]" : "border-white/20"
                      }`} />
                    <p className="text-xs font-bold text-white tracking-wide">{o.label}</p>
                  </div>
                  <p className="text-[10px] text-white/40 pl-6.5 leading-snug">{o.desc}</p>
                </button>
              ))}
            </div>
          )}

          {processing && (
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Engine Status</span>
                </div>
                <span className="text-[11px] text-purple-300 font-black italic">{statusMessage || "Calculating..."}</span>
              </div>
              <div className="relative h-2 w-full bg-black/40 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      }
      action={
        <div className="flex flex-col gap-4 w-full">
          <SecurityModal
            isOpen={securityModalOpen}
            onClose={() => setSecurityModalOpen(false)}
            onConfirm={handleSecurityConfirm}
            protectedFiles={[file!]}
          />
          <div className="flex gap-4">
            {processing ? (
              <button
                onClick={cancelCompression}
                className="px-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 group"
              >
                <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Abort</span>
              </button>
            ) : null}
            <button
              onClick={handleCompress}
              disabled={processing || (mode === 'targetSize' && !targetSizeKB) || !!loadError}
              className={`btn btn-primary flex-1 h-14 rounded-2xl shadow-xl shadow-purple-500/10 flex items-center justify-center gap-3 ${processing ? "opacity-90 grayscale-[0.5]" : "hover:shadow-purple-500/20"}`}
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Minimize2 className="w-5 h-5" />}
              <span className="text-sm font-black uppercase tracking-tighter">
                {processing ? "Optimizing PDF..." : "Start Compression"}
              </span>
            </button>
          </div>
        </div>
      }
    />
  );
}

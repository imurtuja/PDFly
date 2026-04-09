"use client";

import { useState } from "react";
import type { ToolControlsProps } from "./types";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";
import SecurityModal from "../pdf/SecurityModal";
import { getProtectedFiles } from "@/lib/pdf/validation";

export default function ProtectControls({
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
  const { pages, totalPages, loading, error: loadError, isProtected } = usePdfLoader(file, true, 30);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const handleProtect = async () => {
    if (!file || !password) return;
    try {
      setProcessing(true); setProgress(20); setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      setProgress(40);
      const res = await fetch("/api/protect-pdf", {
        method: "POST",
        body: formData,
      });

      setProgress(80);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      const blob = await res.blob();
      setResultBlob(blob);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setResultFileName(`${baseName} - Protected - PDFly by Murtuja.pdf`);
      setProgress(100);
    } catch (err) {
      setError(`Failed to protect: ${err instanceof Error ? err.message : "Unknown error"}`);
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
          title="Document Preview"
          description={`${totalPages} pages total. The entire document will be encrypted.`}
          mode="grid"
        >
          {loadError ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center w-full col-span-full">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Already Protected</h3>
              <p className="text-white/40 max-w-sm mb-6">
                This file is already encrypted. If you wish to change the password, please unlock it first.
              </p>
              <Link href="/tool/unlock-pdf" className="btn btn-secondary text-sm">
                Go to Unlock Tool
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 w-full content-start">
              {pages.map((p) => (
                <div
                  key={p.pageNum}
                  className="relative aspect-[3/4] w-full rounded-xl border border-white/10 bg-white/5 shadow-md flex items-center justify-center p-2 mb-2 overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="max-w-full max-h-full object-contain bg-white shadow-sm pointer-events-none" />

                  <div className="absolute top-2 left-2 bg-black/60 shadow-md px-2 py-0.5 rounded text-[10px] text-white pointer-events-none">
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          <h3 className="text-sm font-medium text-white mb-2">Encryption Configuration</h3>

          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 block">
              Secure Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter strong password..."
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner text-sm"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-white/40 mt-3 ml-1 leading-relaxed">
              Provides 256-bit AES encryption. Ensure you do not lose this password as the document cannot be recovered without it.
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
            onClick={handleProtect}
            disabled={!password || processing || !!loadError}
            className="btn btn-primary w-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            {processing ? "Encrypting..." : "Protect PDF"}
          </button>
        </div>
      }
    />
  );
}

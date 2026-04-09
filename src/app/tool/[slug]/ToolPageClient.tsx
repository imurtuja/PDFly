"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { getToolBySlug } from "@/lib/tools";
import UploadBox from "@/components/UploadBox";
import DownloadSection from "@/components/DownloadSection";
import type { SortableFile } from "@/components/tools/types";
import { fileTransfer } from "@/lib/file-transfer";

/* ——— Tool-specific controls ——— */
import MergeControls from "@/components/tools/MergeControls";
import SplitControls from "@/components/tools/SplitControls";
import RotateControls from "@/components/tools/RotateControls";
import DeletePagesControls from "@/components/tools/DeletePagesControls";
import ReorderControls from "@/components/tools/ReorderControls";
import WatermarkControls from "@/components/tools/WatermarkControls";
import PageNumbersControls from "@/components/tools/PageNumbersControls";
import ProtectControls from "@/components/tools/ProtectControls";
import UnlockControls from "@/components/tools/UnlockControls";
import CompressControls from "@/components/tools/CompressControls";
import PdfToImageControls from "@/components/tools/PdfToImageControls";
import ImageToPdfControls from "@/components/tools/ImageToPdfControls";

export default function ToolPageClient({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);

  const [files, setFiles] = useState<SortableFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleReset = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
    setResultFileName("");
    setError(null);
    setProgress(0);
    setProcessing(false);
  }, []);

  const handleFiles = useCallback((incomingFiles: File[]) => {
    const newSortableFiles: SortableFile[] = incomingFiles.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2, 9)}`,
      file
    }));

    if (tool?.acceptMultiple) {
      setFiles(prev => [...prev, ...newSortableFiles]);
    } else {
      setFiles(newSortableFiles.slice(0, 1));
    }
  }, [tool]);

  // AUTO-HANDOVER: Check if a file was passed from another tool
  useEffect(() => {
    if (tool && fileTransfer.hasPendingFiles()) {
      const pending = fileTransfer.peekPendingFiles();
      if (pending) {
        handleFiles(pending);
        fileTransfer.popPendingFiles(); // Clear now that they are handled
      }
    }
  }, [handleFiles, tool]);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-4">
            Tool not found
          </h1>
          <Link
            href="/tools"
            className="text-purple-400 text-sm hover:underline"
          >
            ← Back to tools
          </Link>
        </div>
      </div>
    );
  }

  const Icon = tool.icon;

  const controlsProps = {
    files,
    setFiles,
    processing,
    setProcessing,
    progress,
    setProgress,
    resultBlob,
    setResultBlob,
    resultFileName,
    setResultFileName,
    error,
    setError,
  };

  const renderControls = () => {
    switch (slug) {
      case "merge-pdf":
        return <MergeControls {...controlsProps} />;
      case "split-pdf":
        return <SplitControls {...controlsProps} />;
      case "rotate-pdf":
        return <RotateControls {...controlsProps} />;
      case "delete-pages":
        return <DeletePagesControls {...controlsProps} />;
      case "reorder-pages":
        return <ReorderControls {...controlsProps} />;
      case "add-watermark":
        return <WatermarkControls {...controlsProps} />;
      case "add-page-numbers":
        return <PageNumbersControls {...controlsProps} />;
      case "protect-pdf":
        return <ProtectControls {...controlsProps} />;
      case "unlock-pdf":
        return <UnlockControls {...controlsProps} />;
      case "compress-pdf":
        return <CompressControls {...controlsProps} />;
      case "pdf-to-image":
        return <PdfToImageControls {...controlsProps} />;
      case "image-to-pdf":
        return <ImageToPdfControls {...controlsProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* ——— CENTERED CONTAINER ——— */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Tools
        </Link>

        {/* Tool header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-start gap-4 mb-10"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${tool.color}12` }}
          >
            <Icon className="w-6 h-6" style={{ color: tool.color }} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
              {tool.name}
            </h1>
            <p className="text-sm text-white/40 mt-1">{tool.description}</p>
          </div>
        </motion.div>

        {/* ——— WORKFLOW ——— */}
        <AnimatePresence mode="wait">
          {resultBlob ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <DownloadSection
                resultBlob={resultBlob}
                fileName={resultFileName}
                onReset={handleReset}
              />
            </motion.div>
          ) : (
            <motion.div
              key="workflow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Step 1: Upload */}
              <UploadBox
                accept={tool.acceptTypes}
                multiple={tool.acceptMultiple}
                files={files.map(f => f.file)}
                onFiles={handleFiles}
              />

              {/* Step 2: Tool Workspace (Controls & Previews) */}
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-8"
                >
                  {renderControls()}
                </motion.div>
              )}

              {/* Processing */}
              {processing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="text-sm font-medium text-white">
                      Processing...
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-[10px] text-white/25 mt-2">
                    {progress}% complete
                  </p>
                </motion.div>
              )}

              {/* Error */}
              {error && !processing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl bg-red-500/[0.06] border border-red-500/15 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, AlertCircle } from "lucide-react";

interface UploadBoxProps {
  accept: string;
  multiple: boolean;
  files: File[];
  onFiles: (files: File[]) => void;
  maxSizeMB?: number;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function UploadBox({
  accept,
  multiple,
  files,
  onFiles,
  maxSizeMB = 100,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndAdd = useCallback(
    (incoming: FileList | File[]) => {
      setError(null);
      const arr = Array.from(incoming);
      const acceptExts = accept.split(",").map((s) => s.trim().toLowerCase());
      const maxBytes = maxSizeMB * 1024 * 1024;

      for (const f of arr) {
        const ext = "." + f.name.split(".").pop()?.toLowerCase();
        if (!acceptExts.includes(ext) && !acceptExts.includes("*")) {
          setError(`Invalid file type: ${f.name}. Accepted: ${accept}`);
          return;
        }
        if (f.size > maxBytes) {
          setError(`File too large: ${f.name} (${formatSize(f.size)}). Max: ${maxSizeMB}MB`);
          return;
        }
      }

      const newFiles = multiple ? arr : arr.slice(0, 1);
      onFiles(newFiles);
    },
    [accept, files, maxSizeMB, multiple, onFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) {
        validateAndAdd(e.dataTransfer.files);
      }
    },
    [validateAndAdd]
  );

  const removeFile = (index: number) => {
    onFiles(files.filter((_, i) => i !== index));
    setError(null);
  };

  // If files already uploaded, show compact "add more" state if multiple
  if (files.length > 0) {
    if (!multiple) {
      return (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <div className="flex items-center gap-3 min-w-0">
             <FileText className="w-4 h-4 text-purple-400 shrink-0" />
             <div className="truncate text-sm text-white">{files[0].name}</div>
          </div>
          <button onClick={() => removeFile(0)} className="p-1.5 hover:bg-white/10 text-white/30 hover:text-white rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Add more button (compact) */}
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full py-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/[0.07] text-sm text-white/50 hover:text-white transition-all"
        >
          <Upload className="w-4 h-4" />
          + Add more files
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              validateAndAdd(e.target.files);
              e.target.value = "";
            }
          }}
        />

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-xs mt-3"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Empty state — upload zone
  return (
    <div className="space-y-3">
      <div
        className={`bg-white/5 border border-dashed border-white/20 rounded-2xl p-10 sm:p-14 text-center transition-all ${
          dragging ? "border-purple-500 bg-purple-500/5 scale-[1.02]" : "hover:bg-white/[0.07] hover:border-white/30"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              validateAndAdd(e.target.files);
              e.target.value = "";
            }
          }}
        />

        <motion.div
          animate={{ scale: dragging ? 1.04 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-[var(--color-primary-light)]" />
          </div>
          <div>
            <p className="text-white font-medium text-sm mb-1">
              {dragging ? "Drop files here" : "Drag & drop your files here"}
            </p>
            <p className="text-white/30 text-xs">
              or click to browse · {accept} · max {maxSizeMB}MB
            </p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-xs"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

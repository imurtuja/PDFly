import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, Trash2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { fileTransfer } from "@/lib/file-transfer";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  protectedFiles: File[];
}

export default function SecurityModal({
  isOpen,
  onClose,
  onConfirm,
  protectedFiles,
}: SecurityModalProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleGoToUnlock = () => {
    fileTransfer.setPendingFiles(protectedFiles);
    router.push("/tool/unlock-pdf");
    onClose();
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-[#0b0a1a] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Simple Header */}
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-inner">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Protected Files</h3>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-widest mt-0.5">{protectedFiles.length} file{protectedFiles.length > 1 ? 's' : ''} detected</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all order-last"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="px-8 flex flex-col gap-4">
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4 max-h-[160px] overflow-y-auto custom-scrollbar-thin">
                <div className="space-y-3">
                  {protectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] group hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Lock className="w-3.5 h-3.5 text-red-500/50 shrink-0" />
                        <span className="text-sm text-white/70 truncate font-medium">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Locked</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-white/40 leading-relaxed text-center px-2">
                Encrypted PDFs cannot be processed in your current workspace. Would you like to switch to the **Unlock tool** with these files?
              </p>
            </div>

            {/* Footer / Actions */}
            <div className="p-8 pt-6 space-y-3">
              <button
                onClick={handleGoToUnlock}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-3 group"
              >
                <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Unlock These Files
              </button>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/40 text-[11px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Keep Others
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-red-400 text-[11px] font-bold uppercase tracking-widest border border-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Discard & Continue
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

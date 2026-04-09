import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, File as FileIcon, Loader2, Lock, FileText } from "lucide-react";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import { useRouter } from "next/navigation";
import { fileTransfer } from "@/lib/file-transfer";

interface DraggableFileCardProps {
  id: string; 
  file: File;
  onRemove: (id: string) => void;
  index: number;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function DraggableFileCard({ id, file, onRemove, index }: DraggableFileCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  // We only need the first page for the cover preview
  const { pages, totalPages, loading, error, isProtected } = usePdfLoader(file, false, 1);

  const handleGoToUnlock = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (file) {
      fileTransfer.setPendingFiles([file]);
      router.push("/tool/unlock-pdf");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col bg-white/[0.03] border ${
        isDragging 
          ? "border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)] scale-[1.05] z-50" 
          : isProtected 
            ? "border-red-500/30 hover:border-red-500/50 shadow-[0_10px_30px_rgba(239,68,68,0.1)]"
            : "border-white/10 hover:border-white/20 shadow-xl"
      } rounded-2xl overflow-hidden w-[280px] h-[433.5px] shrink-0 transition-all duration-300 ease-out`}
    >
      {/* Floating Controls Layer */}
      <div className="absolute top-3 left-3 right-3 z-30 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white/50 hover:text-white hover:bg-black/80 transition-all shadow-lg"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Action: Remove */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          className="p-2 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-500/80 hover:text-red-400 hover:bg-red-500/40 rounded-xl transition-all shadow-lg group/remove"
        >
          <X className="w-4 h-4 group-hover/remove:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Preview Area - Fixed height to maintain overall card height symmetry */}
      <div className={`relative w-full h-[340px] shrink-0 overflow-hidden flex items-center justify-center ${isProtected ? "bg-red-500/[0.04]" : "bg-[#0a0a0f]"}`}>
        {/* Subtle Background pattern/gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        
        {loading && !error ? (
          <div className="flex flex-col items-center gap-4">
             <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-2xl animate-pulse" />
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin relative" />
             </div>
             <span className="text-[11px] text-white/30 font-black uppercase tracking-[0.25em]">Analyzing</span>
          </div>
        ) : error || isProtected ? (
          <div className="p-8 flex flex-col items-center justify-center text-center w-full h-full space-y-8">
             {isProtected ? (
               <div className="flex flex-col items-center justify-center w-full">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-red-500/30 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-red-600/5 border border-red-500/30 flex items-center justify-center shadow-2xl">
                      <Lock className="w-12 h-12 text-red-500 shadow-lg" />
                    </div>
                  </div>
                  <div className="space-y-4">
                     <h5 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Protected</h5>
                     <button 
                       onClick={handleGoToUnlock}
                       className="inline-block px-8 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all font-bold tracking-tight shadow-xl"
                     >
                       Unlock PDF
                     </button>
                  </div>
               </div>
             ) : (
               <>
                 <div className="w-20 h-20 rounded-3xl bg-red-500/5 border border-red-500/10 flex items-center justify-center">
                    <FileIcon className="w-10 h-10 text-red-400/30" />
                 </div>
                 <p className="text-xs text-red-400/50 font-medium leading-relaxed max-w-[160px]">{error}</p>
               </>
             )}
          </div>
        ) : pages[0] ? (
          <div className="w-full h-full p-6 flex items-center justify-center">
            <img 
              src={pages[0].dataUrl} 
              alt={`Preview of ${file.name}`} 
              className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
        ) : (
          <FileText className="w-20 h-20 text-white/5" />
        )}

        {/* Page Count Badge */}
        {!loading && !error && !isProtected && totalPages > 0 && (
          <div className="absolute bottom-5 right-5 px-4 py-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
             <span className="text-[11px] text-white/60 font-black tracking-widest uppercase">{totalPages} {totalPages === 1 ? 'Page' : 'Pages'}</span>
          </div>
        )}
      </div>

      {/* Info Section - Takes the remaining height */}
      <div className="flex-1 p-4 bg-white/[0.02] border-t border-white/5 flex flex-col justify-center">
        <h4 
          className="text-[13px] font-semibold text-white/90 truncate mb-1"
          title={file.name}
        >
          {file.name}
        </h4>
        <div className="flex items-center justify-between gap-2">
           <p className="text-[10px] font-medium text-white/30 tracking-tight">{formatBytes(file.size)}</p>
           <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(var(--color-glow))] ${isProtected ? "bg-red-500/50 shadow-red-500/50" : "bg-purple-500/50 shadow-purple-500/50"}`} />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                {isProtected ? "Locked" : "Ready"}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import { Combine, Loader2 } from "lucide-react";
import type { ToolControlsProps } from "./types";
import { mergePdfs } from "@/lib/pdf/merge";
import DraggableFileCard from "../pdf/DraggableFileCard";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";
import SecurityModal from "../pdf/SecurityModal";
import { getProtectedFiles } from "@/lib/pdf/validation";
import type { SortableFile } from "./types";

export default function MergeControls({
  files,
  setFiles,
  processing,
  setProcessing,
  setProgress,
  setResultBlob,
  setResultFileName,
  setError,
}: ToolControlsProps) {
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [protectedFiles, setProtectedFiles] = useState<File[]>([]);

  // Setup DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Derive an array of unique ids for the files
  const items = useMemo(() => files.map((f) => f.id), [files]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1 && setFiles) {
        setFiles(arrayMove(files, oldIndex, newIndex));
      }
    }
  };

  const handleRemove = (id: string) => {
    if (setFiles) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  const performMerge = async (filesToMerge: SortableFile[]) => {
    try {
      setProcessing(true);
      setProgress(10);
      setError(null);

      const rawFiles = filesToMerge.map(f => f.file);
      const result = await mergePdfs(rawFiles);
      setProgress(90);

      const blob = new Blob([result as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);

      const baseName = rawFiles[0].name.replace(/\.pdf$/i, "");
      setResultFileName(`${baseName} - Merge PDFs - PDFly by Murtuja.pdf`);
      setProgress(100);
    } catch (err) {
      setError(`Failed to merge: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please upload at least 2 PDF files to merge.");
      return;
    }

    const rawFiles = files.map(f => f.file);
    // Step 1: Check for protected files
    const encrypted = await getProtectedFiles(rawFiles);
    if (encrypted.length > 0) {
      setProtectedFiles(encrypted);
      setSecurityModalOpen(true);
      return;
    }

    await performMerge(files);
  };

  const handleSecurityConfirm = async () => {
    setSecurityModalOpen(false);
    const encryptedNames = new Set(protectedFiles.map(f => f.name));
    const cleanFiles = files.filter(f => !encryptedNames.has(f.file.name));
    
    // Update the UI list permanently as requested
    setFiles(cleanFiles);

    if (cleanFiles.length < 2) {
      setError("After removing protected files, you need at least 2 files to merge.");
      return;
    }

    await performMerge(cleanFiles);
  };

  return (
    <ToolLayout
      preview={
        <UniversalPreview
          title="File Sequence"
          description="Drag and drop files to reorder them before merging."
          mode="grid"
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full content-start pb-8 place-items-center sm:place-items-start">
                {files.map((file, index) => (
                  <DraggableFileCard
                    key={file.id}
                    id={file.id}
                    file={file.file}
                    index={index}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </UniversalPreview>
      }
      options={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white mb-1">Merge Options</h3>
              <p className="text-xs text-white/35">
                {files.length} file{files.length !== 1 ? "s" : ""} selected.
              </p>
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
            protectedFiles={protectedFiles}
          />
          <button
            onClick={handleMerge}
            disabled={files.length < 2 || processing}
            className="btn btn-primary w-full"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Combine className="w-4 h-4" />
            )}
            {processing ? "Merging..." : `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      }
    />
  );
}

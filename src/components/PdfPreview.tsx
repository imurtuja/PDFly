"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface PdfPreviewProps {
  file: File;
  maxPages?: number;
}

interface PageThumb {
  pageNum: number;
  dataUrl: string;
}

export default function PdfPreview({ file, maxPages = 6 }: PdfPreviewProps) {
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const renderingRef = useRef(false);

  const renderPages = useCallback(async () => {
    if (renderingRef.current) return;
    renderingRef.current = true;
    setLoading(true);
    setError(null);
    setPages([]);

    try {
      // @ts-ignore
      const pdfjsLib = await import(/* webpackIgnore: true */ "https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.min.mjs");
      const workerUrl = `https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);

      const pagesToRender = Math.min(pdf.numPages, maxPages);
      const results: PageThumb[] = [];

      for (let i = 1; i <= pagesToRender; i++) {
        const page = await pdf.getPage(i);
        const scale = 1.2;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport } as any).promise;

        results.push({
          pageNum: i,
          dataUrl: canvas.toDataURL("image/jpeg", 0.75),
        });

        setPages([...results]);
      }
    } catch (err) {
      console.error("PDF preview error:", err);
      setError("Could not render PDF preview");
    } finally {
      setLoading(false);
      renderingRef.current = false;
    }
  }, [file, maxPages]);

  useEffect(() => {
    renderPages();
  }, [renderPages]);

  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-white/30">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/60">
          Page Preview
          {totalPages > 0 && (
            <span className="text-white/30 ml-2 font-normal">
              {Math.min(pages.length, maxPages)} of {totalPages}
            </span>
          )}
        </h3>
      </div>

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {pages.map((page, i) => (
          <motion.div
            key={page.pageNum}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="relative rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.dataUrl}
              alt={`Page ${page.pageNum}`}
              className="w-full h-auto block"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
              <span className="text-[10px] font-medium text-white">
                {page.pageNum}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Skeletons */}
        {loading &&
          Array.from(
            {
              length: Math.max(
                0,
                (totalPages > 0 ? Math.min(totalPages, maxPages) : maxPages) -
                  pages.length
              ),
            },
            (_, i) => (
              <div
                key={`skel-${i}`}
                className="aspect-[3/4] rounded-lg skeleton"
              />
            )
          )}
      </div>

      {totalPages > maxPages && !loading && (
        <p className="text-[11px] text-white/25 text-center">
          +{totalPages - maxPages} more page
          {totalPages - maxPages > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

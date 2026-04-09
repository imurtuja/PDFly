import { useState, useEffect, useRef } from "react";

export interface PdfPageData {
  pageNum: number;
  dataUrl: string;
}

export interface PdfLoaderResult {
  pages: PdfPageData[];
  totalPages: number;
  loading: boolean;
  error: string | null;
  isProtected: boolean;
}

export function usePdfLoader(file: File | null, loadAll: boolean = false, initialLimit: number = 5): PdfLoaderResult {
  const [pages, setPages] = useState<PdfPageData[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProtected, setIsProtected] = useState(false);

  const currentFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (!file) {
      setPages([]);
      setTotalPages(0);
      setLoading(false);
      setError(null);
      setIsProtected(false);
      return;
    }

    currentFileRef.current = file;
    let isMounted = true;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      setIsProtected(false);
      setPages([]);

      try {
        const pdfjsLib = await import("pdfjs-dist");
        const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

        const arrayBuffer = await file!.arrayBuffer();
        if (currentFileRef.current !== file || !isMounted) return;

        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          verbosity: 0 // Silences background parsing warnings safely
        }).promise;
        if (currentFileRef.current !== file || !isMounted) return;
        
        setTotalPages(pdf.numPages);

        const pagesToRender = loadAll ? pdf.numPages : Math.min(pdf.numPages, initialLimit);
        let results: PdfPageData[] = [];

        // Chunk processing to avoid blocking main thread
        const chunk = 3;
        for (let i = 1; i <= pagesToRender; i++) {
          if (currentFileRef.current !== file || !isMounted) return;

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

          results.push({
            pageNum: i,
            dataUrl: canvas.toDataURL("image/jpeg", 0.7),
          });

          if (i % chunk === 0 || i === pagesToRender) {
            if (isMounted && currentFileRef.current === file) {
              setPages([...results]);
              // Yield to main thread briefly
              await new Promise(r => setTimeout(r, 10));
            }
          }
        }
      } catch (err: any) {
        const isPasswordError = err.name === "PasswordException" || err.code === 1;
        if (!isPasswordError) {
          console.error("PDF Preview Error:", err);
        }
        
        if (isMounted) {
          if (isPasswordError) {
            setIsProtected(true);
            setError("PASSWORD_PROTECTED");
          } else {
            setError("Failed to generate PDF preview.");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPdf();
    return () => { isMounted = false; };
  }, [file, loadAll, initialLimit]);

  return { pages, totalPages, loading, error, isProtected };
}

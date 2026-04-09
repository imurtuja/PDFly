
import type * as PdfJs from 'pdfjs-dist';
import type { jsPDF as JsPdfType } from 'jspdf';

// Lazy-loaded library references
let pdfjsLib: typeof PdfJs | null = null;
let jsPDF: typeof JsPdfType | null = null;

async function initLibs() {
    if (typeof window === 'undefined') return;
    if (pdfjsLib && jsPDF) return;

    pdfjsLib = await import('pdfjs-dist');
    const jspdfModule = await import('jspdf');
    jsPDF = jspdfModule.jsPDF;

    // Set up worker
    if (pdfjsLib && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }
}

export interface CompressProgress {
  message: string;
  percent: number;
}

export interface CompressOptions {
  mode: "preset" | "targetSize";
  preset: "low" | "medium" | "high";
  targetSizeKB: number;
  onProgress?: (progress: CompressProgress) => void;
  shouldCancel?: () => boolean;
}

const sleep = (ms = 0) => new Promise(r => setTimeout(r, ms));

async function renderPageToImage(
    page: any, 
    scale: number, 
    quality: number, 
    format: 'image/jpeg' | 'image/png',
    shouldCancel?: () => boolean
): Promise<{ dataUrl: string, width: number, height: number }> {
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    // Use alpha: false for JPEG to optimize
    const ctx = canvas.getContext('2d', { alpha: format === 'image/png' });
    if (!ctx) throw new Error("Failed to get canvas context");
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Quality Improvement: Enable Smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    // Quality Improvement: Background fill for artifacts
    if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    } as any;
    
    const renderTask = page.render(renderContext);
    
    if (shouldCancel) {
       const checkInterval = setInterval(() => {
           if (shouldCancel()) renderTask.cancel();
       }, 100);
       await renderTask.promise.catch((e: any) => {
           if (e.name === 'RenderingCancelledException') return;
           throw e;
       });
       clearInterval(checkInterval);
    } else {
       await renderTask.promise;
    }
    
    if (shouldCancel && shouldCancel()) throw new Error("Cancelled by user");

    const dataUrl = canvas.toDataURL(format, format === 'image/png' ? undefined : quality);
    const result = { dataUrl, width: viewport.width, height: viewport.height };
    
    // MEMORY OPTIMIZATION: Flush canvas immediately
    canvas.width = 0;
    canvas.height = 0;
    page.cleanup();
    
    return result;
}

/**
 * Renders only the first page for preview purposes.
 */
export async function generateCompressionPreview(file: File, scale: number, quality: number, format: 'image/jpeg' | 'image/png'): Promise<string> {
    await initLibs();
    if (!pdfjsLib) throw new Error("Library init failed");

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const { dataUrl } = await renderPageToImage(page, scale, quality, format);
    await pdf.destroy();
    return dataUrl;
}

async function buildPdfFromImages(file: File, scale: number, quality: number, format: 'image/jpeg' | 'image/png', options: CompressOptions, passName: string): Promise<Blob> {
    const { onProgress, shouldCancel } = options;
    
    if (!pdfjsLib || !jsPDF) await initLibs();
    if (!pdfjsLib || !jsPDF) throw new Error("Libraries not initialized");

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    
    // MEMORY OPTIMIZATION: We do NOT store an array of images.
    // We stream them page-by-page into jsPDF.
    let doc: any = null;
    
    for (let i = 1; i <= totalPages; i++) {
        if (shouldCancel && shouldCancel()) throw new Error("Cancelled by user");
        
        if (onProgress) {
            onProgress({ 
                message: `${passName ? `${passName} | ` : ''}Rendering page ${i}/${totalPages}...`, 
                percent: Math.floor((i / totalPages) * 90) 
            });
        }
        
        const page = await pdf.getPage(i);
        const { dataUrl, width, height } = await renderPageToImage(page, scale, quality, format, shouldCancel);
        
        // Wait for UI thread
        await sleep(20);
        
        const orientation = width > height ? 'l' : 'p';
        const jsPdfFormat = [width, height];
        
        if (i === 1) {
            doc = new jsPDF({ orientation, unit: 'pt', format: jsPdfFormat });
        } else {
            doc!.addPage(jsPdfFormat, orientation);
        }
        
        doc!.setPage(i);
        // jsPDF addImage automatically handles the dataUrl encoding
        doc!.addImage(dataUrl, format === 'image/png' ? 'PNG' : 'JPEG', 0, 0, width, height);
        
        // Minor cleanup for internal jsPDF references
        // (Note: jsPDF usually handles this, but let's be safe)
    }
    
    if (!doc) throw new Error("Failed to generate PDF document");
    
    if (onProgress) onProgress({ message: "Finalizing optimization...", percent: 95 });
    
    const blob = doc.output('blob');
    await pdf.destroy();
    
    return blob;
}

export async function processClientCompression(file: File, options: CompressOptions): Promise<Blob> {
    await initLibs();
    const { mode, preset, targetSizeKB, onProgress, shouldCancel } = options;
    
    if (mode === 'preset') {
        let scale = 1.5;
        let quality = 0.85;
        let format: 'image/jpeg' | 'image/png' = 'image/jpeg';
        
        if (preset === 'high') { scale = 2.0; quality = 1.0; format = 'image/png'; }
        else if (preset === 'low') { scale = 1.2; quality = 0.7; format = 'image/jpeg'; }
        
        return await buildPdfFromImages(file, scale, quality, format, options, '');
    } 
    else {
        // SMART TARGET MODE: quality first, then scale
        const targetBytes = targetSizeKB * 1024;
        
        const passes: { scale: number, quality: number }[] = [
            { scale: 2.0, quality: 0.95 },
            { scale: 2.0, quality: 0.85 },
            { scale: 2.0, quality: 0.75 },
            { scale: 1.5, quality: 0.75 },
            { scale: 1.2, quality: 0.70 },
            { scale: 1.0, quality: 0.60 } // Absolute floor
        ];
        
        let bestBlob: Blob | null = null;
        
        for (let i = 0; i < passes.length; i++) {
            if (shouldCancel && shouldCancel()) throw new Error("Cancelled by user");
            
            const pass = passes[i];
            const passName = `Pass ${i+1}/${passes.length}`;
            
            const blob = await buildPdfFromImages(file, pass.scale, pass.quality, 'image/jpeg', options, passName);
            bestBlob = blob;
            
            if (blob.size <= targetBytes) {
                if (onProgress) onProgress({ message: `Success! Target reached at Pass ${i+1}.`, percent: 100 });
                break;
            }

            if (onProgress) onProgress({ message: `Pass ${i+1} complete. Size: ${(blob.size/1024).toFixed(0)} KB (Target: ${targetSizeKB} KB)`, percent: 95 });
            await sleep(300);
        }
        
        return bestBlob!;
    }
}


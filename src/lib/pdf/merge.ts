import { PDFDocument } from "pdf-lib";

/**
 * Merges multiple PDF files into a single document.
 * 
 * Standardizes all pages to a consistent A4 size without embedding 
 * as FormXObjects, preserving fair file size and quality.
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  // Standard A4 dimensions in points
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  for (const file of files) {
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      
      const copiedPages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
      
      for (const page of copiedPages) {
        const { width: srcWidth, height: srcHeight } = page.getSize();
        
        // 1. Determine the best orientation based on the source aspect ratio
        const isLandscape = srcWidth > srcHeight;
        const targetWidth = isLandscape ? A4_HEIGHT : A4_WIDTH;
        const targetHeight = isLandscape ? A4_WIDTH : A4_HEIGHT;

        // 2. Calculate Scale-to-Fit (maintaining aspect ratio)
        const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);
        
        const drawWidth = srcWidth * scale;
        const drawHeight = srcHeight * scale;

        // 3. Calculate centering coordinates
        const xOffset = (targetWidth - drawWidth) / 2;
        const yOffset = (targetHeight - drawHeight) / 2;

        // 4. Scale content from origin
        page.scaleContent(scale, scale);
        
        // 5. Translate content to center
        page.translateContent(xOffset, yOffset);
        
        // 6. Set the final page size to standard A4 (or landscape A4)
        page.setSize(targetWidth, targetHeight);

        mergedDoc.addPage(page);
      }
    } catch (err) {
      console.error(`Error processing file ${file.name}:`, err);
      // Continue to next file to be resilient, or rethrow if preferred
    }
  }

  return mergedDoc.save();
}

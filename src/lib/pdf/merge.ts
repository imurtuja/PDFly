import { PDFDocument } from "pdf-lib";

/**
 * Merges multiple PDF files into a single document.
 * 
 * IMPORTANT: This implementation standardizes all pages to a consistent A4 size.
 * This prevents the common issue of merged documents having wildly different 
 * page dimensions depending on the source files' resolution or quality.
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
      
      // Instead of copying dictionary objects (which preserves inconsistent MediaBoxes),
      // we embed each page as a FormXObject. This allows us to treat it as 
      // a single graphic that can be scaled and placed on a fixed-size canvas.
      const embeddedPages = await mergedDoc.embedPages(pdf.getPages());

      for (const embeddedPage of embeddedPages) {
        const { width: srcWidth, height: srcHeight } = embeddedPage;
        
        // 1. Determine the best orientation based on the source aspect ratio
        const isLandscape = srcWidth > srcHeight;
        const targetWidth = isLandscape ? A4_HEIGHT : A4_WIDTH;
        const targetHeight = isLandscape ? A4_WIDTH : A4_HEIGHT;

        // 2. Create a clean, standardized A4 page
        const newPage = mergedDoc.addPage([targetWidth, targetHeight]);

        // 3. Calculate Scale-to-Fit (maintaining aspect ratio)
        const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);
        
        const drawWidth = srcWidth * scale;
        const drawHeight = srcHeight * scale;

        // 4. Calculate centering coordinates
        const xOffset = (targetWidth - drawWidth) / 2;
        const yOffset = (targetHeight - drawHeight) / 2;

        // 5. Draw the source content onto the standardized canvas
        newPage.drawPage(embeddedPage, {
          x: xOffset,
          y: yOffset,
          width: drawWidth,
          height: drawHeight,
        });
      }
    } catch (err) {
      console.error(`Error processing file ${file.name}:`, err);
      // Continue to next file to be resilient, or rethrow if preferred
    }
  }

  return mergedDoc.save();
}

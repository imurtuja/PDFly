import { PDFDocument } from "pdf-lib";

/**
 * Deletes specified pages from a PDF.
 * 
 * NOTE: Instead of using pdf.removePage(), which leaves abandoned resources 
 * (images, fonts, etc.) inside the file, we create a BRAND NEW document 
 * and copy only the pages we want to keep. This ensures the output file 
 * size is properly reduced.
 */
export async function deletePages(
  file: File,
  pagesToDelete: number[] // 0-indexed
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes);
  
  const totalPages = srcDoc.getPageCount();
  const deleteSet = new Set(pagesToDelete);
  
  // 1. Identify indices of pages we want to KEEP
  const indicesToKeep: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (!deleteSet.has(i)) {
      indicesToKeep.push(i);
    }
  }

  // 2. Fallback: If user tried to delete EVERYTHING, we should probably keep at least one page
  // or return an error. In this tool, we assume validation happened in the UI.
  if (indicesToKeep.length === 0) {
    throw new Error("Cannot delete all pages. At least one page must remain.");
  }

  // 3. Create a clean new document
  const dstDoc = await PDFDocument.create();
  
  // 4. Copy ONLY the desired pages
  // copyPages handles resource deduplication and purging of orphaned objects
  const copiedPages = await dstDoc.copyPages(srcDoc, indicesToKeep);
  copiedPages.forEach((page) => dstDoc.addPage(page));

  // 5. Save with standard optimization
  return dstDoc.save();
}

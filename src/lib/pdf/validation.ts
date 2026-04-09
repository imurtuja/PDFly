import { PDFDocument } from "pdf-lib";

/**
 * Utility to check if PDF files are password protected.
 */
export interface EncryptionStatus {
  file: File;
  isProtected: boolean;
}

/**
 * Checks a list of files and returns those that are password protected.
 * This uses pdf-lib to reliably detect encryption, avoiding false positives 
 * from naive string searches in metadata.
 */
export async function getProtectedFiles(files: File[]): Promise<File[]> {
  const results: File[] = [];

  for (const file of files) {
    try {
      const bytes = await file.arrayBuffer();
      
      // pdf-lib will throw during load if the file is encrypted, 
      // as it does not support encrypted PDFs.
      await PDFDocument.load(bytes);
    } catch (err: unknown) {
      const error = err as Error;
      const message = error.message?.toLowerCase() || "";
      
      // Check for specific encryption-related keywords in the error message
      if (
        message.includes("encrypted") || 
        message.includes("password") ||
        message.includes("decryption")
      ) {
        results.push(file);
      }
    }
  }

  return results;
}

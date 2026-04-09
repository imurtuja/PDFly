import { PDFDocument } from "@cantoo/pdf-lib";

export async function unlockPdf(
  file: File,
  password: string
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();

  // Load with password using @cantoo/pdf-lib which supports decryption
  const pdf = await PDFDocument.load(bytes, {
    password,
    ignoreEncryption: false,
  });

  // Re-save without encryption (it's decrypted now)
  return pdf.save();
}

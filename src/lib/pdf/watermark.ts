import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number;
  rotation?: number; // degrees
  color?: { r: number; g: number; b: number };
  position?: "center" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  fitToPage?: boolean;
}

export async function addWatermark(
  file: File,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  const fontSize = options.fontSize ?? 48;
  const opacity = options.opacity ?? 0.15;
  const rotation = options.rotation ?? 45;
  const color = options.color ?? { r: 0.5, g: 0.5, b: 0.5 };
  const position = options.position ?? "center";

  for (const page of pages) {
    const { width, height } = page.getSize();
    
    let currentFontSize = fontSize;
    
    // Auto-scale font size if fitToPage is enabled
    if (options.fitToPage) {
      const isDiagonal = (Math.abs(rotation) % 90) !== 0; 
      const maxAvailableWidth = isDiagonal
        ? Math.sqrt(width * width + height * height) * 0.8
        : width * 0.8;
      
      let testSize = 10;
      while (font.widthOfTextAtSize(options.text, testSize) < maxAvailableWidth && testSize < 300) {
        testSize += 2;
      }
      currentFontSize = testSize - 2;
    }

    const textWidth = font.widthOfTextAtSize(options.text, currentFontSize);
    const textHeight = currentFontSize; // rough boundary box

    let cx = width / 2;
    let cy = height / 2;
    const padding = 40;

    if (position === "topLeft") {
      cx = padding + textWidth / 2;
      cy = height - padding - textHeight / 2;
    } else if (position === "topRight") {
      cx = width - padding - textWidth / 2;
      cy = height - padding - textHeight / 2;
    } else if (position === "bottomLeft") {
      cx = padding + textWidth / 2;
      cy = padding + textHeight / 2;
    } else if (position === "bottomRight") {
      cx = width - padding - textWidth / 2;
      cy = padding + textHeight / 2;
    }

    // Convert CSS rotation (clockwise positive) to PDF logic (counter-clockwise positive)
    const pdfRotation = -rotation;
    const theta = pdfRotation * Math.PI / 180;
    
    const x = cx - (textWidth / 2) * Math.cos(theta) + (textHeight / 2) * Math.sin(theta);
    const y = cy - (textWidth / 2) * Math.sin(theta) - (textHeight / 2) * Math.cos(theta);

    page.drawText(options.text, {
      x,
      y,
      size: currentFontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(pdfRotation),
    });
  }

  return pdf.save();
}

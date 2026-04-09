import { NextRequest } from "next/server";
import { PDFDocument } from "pdf-lib";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    
    // Parse options
    const orientation = formData.get("orientation") as string || "auto"; // auto | portrait | landscape
    const marginType = formData.get("margin") as string || "none"; // none | small
    const fit = formData.get("fit") as string || "contain"; // contain | cover

    if (!files.length) {
      return Response.json({ error: "No images provided" }, { status: 400 });
    }

    const sharp = (await import("sharp")).default;
    const pdf = await PDFDocument.create();

    const A4_W = 595.28;
    const A4_H = 841.89;
    
    const marginAmt = marginType === "small" ? 30 : 0;

    for (const file of files) {
      const bytes = Buffer.from(await file.arrayBuffer());

      // Auto-orient respects EXIF metadata!
      const pipeline = sharp(bytes).rotate();
      
      // We must extract width/height AFTER the pipeline has executed
      // because EXIF rotation swaps dimensions.
      const { data: pngBuffer, info } = await pipeline.png().toBuffer({ resolveWithObject: true });
      
      const imgW = info.width || A4_W;
      const imgH = info.height || A4_H;
      
      const image = await pdf.embedPng(pngBuffer);

      let pageW = imgW;
      let pageH = imgH;
      let drawX = 0;
      let drawY = 0;
      let drawW = imgW;
      let drawH = imgH;

      if (orientation !== "auto") {
        pageW = orientation === "landscape" ? A4_H : A4_W;
        pageH = orientation === "landscape" ? A4_W : A4_H;

        const availW = pageW - marginAmt * 2;
        const availH = pageH - marginAmt * 2;

        const ratioImg = imgW / imgH;
        const ratioAvail = availW / availH;

        if (fit === "contain") {
          // Fit entirely within available bounds
          if (ratioImg > ratioAvail) {
            drawW = availW;
            drawH = availW / ratioImg;
          } else {
            drawH = availH;
            drawW = availH * ratioImg;
          }
        } else {
          // Cover bounds entirely
          if (ratioImg > ratioAvail) {
            drawH = availH;
            drawW = availH * ratioImg;
          } else {
            drawW = availW;
            drawH = availW / ratioImg;
          }
        }

        drawX = (pageW - drawW) / 2;
        drawY = (pageH - drawH) / 2;
      } else {
        // Auto: Create page EXACTLY matching image dimensions + margins
        pageW = imgW + marginAmt * 2;
        pageH = imgH + marginAmt * 2;
        drawX = marginAmt;
        drawY = marginAmt;
      }

      const page = pdf.addPage([pageW, pageH]);
      page.drawImage(image, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH,
      });
    }

    const pdfBytes = await pdf.save();

    return new Response(pdfBytes as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="images.pdf"`,
      },
    });
  } catch (err) {
    console.error("Image to PDF error:", err);
    return Response.json(
      { error: "Failed to convert images to PDF" },
      { status: 500 }
    );
  }
}

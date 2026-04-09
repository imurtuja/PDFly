import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "@cantoo/pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;

    if (!file || !password) {
      return NextResponse.json(
        { error: "File and password are required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      // Use @cantoo/pdf-lib to load and decrypt the document
      const pdfDoc = await PDFDocument.load(buffer, {
        password,
        ignoreEncryption: false,
      });
      
      const pdfBytes = await pdfDoc.save();

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="unlocked-${file.name}"`,
        },
      });
    } catch (decryptError: any) {
      console.error("Decryption failed:", decryptError.message);
      
      // Check if it's a password error or a parsing error
      const isPasswordError = decryptError.message.toLowerCase().includes("password") || 
                              decryptError.message.toLowerCase().includes("encrypt");
      
      return NextResponse.json(
        { 
          error: isPasswordError 
            ? "Incorrect password. Please check and try again." 
            : "PDF decryption failed during processing: " + decryptError.message 
        },
        { status: 403 }
      );
    }
  } catch (err: any) {
    console.error("Unlock PDF API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}

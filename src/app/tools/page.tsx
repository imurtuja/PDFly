import ToolsGrid from "@/components/ToolsGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All PDF Tools - Free Online PDFly by Murtuja",
  description:
    "Browse all available PDF tools by Murtuja. Merge, split, compress, convert, rotate, watermark, protect, unlock and more - 100% free, fast, and private.",
  alternates: {
    canonical: "https://pdfly.murtuja.in/tools",
  },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#05040e]">
      <ToolsGrid />
    </div>
  );
}

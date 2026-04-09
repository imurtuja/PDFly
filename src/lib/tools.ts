import {
  Combine,
  Scissors,
  Minimize2,
  Image,
  FileImage,
  RotateCw,
  Trash2,
  ArrowUpDown,
  Droplets,
  Hash,
  Lock,
  Unlock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ToolDef {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: "organize" | "convert" | "optimize" | "security";
  acceptMultiple: boolean;
  acceptTypes: string;
  comingSoon?: boolean;
}

export const tools: ToolDef[] = [
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDF files into a single document.",
    icon: Combine,
    color: "#6366f1",
    category: "organize",
    acceptMultiple: true,
    acceptTypes: ".pdf",
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    description: "Split a PDF into multiple files by page ranges.",
    icon: Scissors,
    color: "#f43f5e",
    category: "organize",
    acceptMultiple: false,
    acceptTypes: ".pdf",
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF file size for easy sharing.",
    icon: Minimize2,
    color: "#10b981",
    category: "optimize",
    acceptMultiple: false,
    acceptTypes: ".pdf",
    comingSoon: true,
  },
  {
    slug: "pdf-to-image",
    name: "PDF to Image",
    description: "Convert PDF pages to JPG or PNG images.",
    icon: Image,
    color: "#f59e0b",
    category: "convert",
    acceptMultiple: false,
    acceptTypes: ".pdf",
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Convert images into a PDF document.",
    icon: FileImage,
    color: "#8b5cf6",
    category: "convert",
    acceptMultiple: true,
    acceptTypes: ".jpg,.jpeg,.png,.webp,.bmp,.gif",
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate PDF pages by 90°, 180°, or 270°.",
    icon: RotateCw,
    color: "#06b6d4",
    category: "organize",
    acceptMultiple: false,
    acceptTypes: ".pdf",
  },
  {
    slug: "delete-pages",
    name: "Delete Pages",
    description: "Remove unwanted pages from your PDF.",
    icon: Trash2,
    color: "#ef4444",
    category: "organize",
    acceptMultiple: false,
    acceptTypes: ".pdf",
  },
  {
    slug: "reorder-pages",
    name: "Reorder Pages",
    description: "Drag and drop to rearrange PDF pages.",
    icon: ArrowUpDown,
    color: "#14b8a6",
    category: "organize",
    acceptMultiple: false,
    acceptTypes: ".pdf",
  },
  {
    slug: "add-watermark",
    name: "Add Watermark",
    description: "Add text watermark across all PDF pages.",
    icon: Droplets,
    color: "#3b82f6",
    category: "optimize",
    acceptMultiple: false,
    acceptTypes: ".pdf",
  },
  {
    slug: "add-page-numbers",
    name: "Page Numbers",
    description: "Add page numbers to your PDF document.",
    icon: Hash,
    color: "#a855f7",
    category: "optimize",
    acceptMultiple: false,
    acceptTypes: ".pdf",
  },
  {
    slug: "protect-pdf",
    name: "Protect PDF",
    description: "Add password protection to your PDF.",
    icon: Lock,
    color: "#ec4899",
    category: "security",
    acceptMultiple: false,
    acceptTypes: ".pdf",
  },
  {
    slug: "unlock-pdf",
    name: "Unlock PDF",
    description: "Remove password from a protected PDF.",
    icon: Unlock,
    color: "#22c55e",
    category: "security",
    acceptMultiple: false,
    acceptTypes: ".pdf",
  },
];

export function getToolBySlug(slug: string): ToolDef | undefined {
  return tools.find((t) => t.slug === slug);
}

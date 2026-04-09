import type { Metadata } from "next";
import { getToolBySlug, tools } from "@/lib/tools";
import ToolPageClient from "./ToolPageClient";

// Generate static params for all tools (helps with ISR/SSG)
export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

// Dynamic SEO metadata per tool
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested PDF tool could not be found.",
    };
  }

  const title = `${tool.name} - Free Online`;
  const description = `${tool.description} Fast, free, and private - powered by PDFly by Murtuja. No file uploads to servers.`;

  return {
    title,
    description,
    openGraph: {
      title: `${tool.name} | PDFly by Murtuja`,
      description: description,
      url: `https://pdfly.murtuja.in/tool/${slug}`,
      siteName: "PDFly by Murtuja",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} | PDFly by Murtuja`,
      description: description,
    },
    alternates: {
      canonical: `https://pdfly.murtuja.in/tool/${slug}`,
    },
  };
}

import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (tool?.comingSoon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
         <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10">
            <Clock className="w-8 h-8" style={{ color: tool.color }} />
         </div>
         <h1 className="text-3xl font-bold text-white mb-3">{tool.name} is Coming Soon</h1>
         <p className="text-white/40 max-w-md mb-8 leading-relaxed">
           We&apos;re currently perfecting this tool to ensure the highest quality results. It will be available shortly. Thank you for your patience!
         </p>
         <Link href="/tools" className="btn btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
         </Link>
      </div>
    );
  }

  return <ToolPageClient slug={slug} />;
}

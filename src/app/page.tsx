import HeroSection from "@/components/HeroSection";
import ToolsGrid from "@/components/ToolsGrid";
import TrustSection from "@/components/TrustSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CtaSection from "@/components/CtaSection";
import ValueStrip from "@/components/ValueStrip";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "PDFly by Murtuja - Free Online PDF Tools | Merge, Split, Compress & More",
  description:
    "Every PDF tool you'll ever need - merge, split, compress, convert, rotate, watermark. 100% free, fast, and private. All processing runs locally in your browser. Built by Murtuja.",
  alternates: {
    canonical: "https://pdfly.murtuja.in",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PDFly by Murtuja",
  url: "https://pdfly.murtuja.in",
  description:
    "Free online PDF tools - merge, split, compress, convert, rotate, watermark. All processing runs locally in your browser.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Murtuja",
    url: "https://murtuja.in",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-[#05040e]">
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col min-h-[100dvh]">
        <div className="flex-1 flex flex-col">
          <HeroSection />
        </div>
        <ValueStrip />
      </div>
      <ToolsGrid limit={8} />
      <TrustSection />
      <HowItWorksSection />
      <CtaSection />
    </div>
  );
}

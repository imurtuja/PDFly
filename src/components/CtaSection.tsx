import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/20 via-[#05040e] to-[#05040e]" />
      
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight font-display">
          Ready to manipulate PDFs <br className="hidden sm:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
            without boundaries?
          </span>
        </h2>
        <p className="text-white/50 text-base md:text-lg mb-10 max-w-xl mx-auto">
          No sign-ups. No watermarks. No file size limits. Just powerful PDF tools running securely in your browser.
        </p>
        
        <Link
          href="/tools"
          className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold text-base hover:bg-white/90 hover:scale-[1.02] shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all"
        >
          Explore All Tools
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}

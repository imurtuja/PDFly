"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#070612]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 to-indigo-600 rounded-lg blur-[1px] opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-full h-full rounded-lg bg-[#0d0c1d] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <FileText className="w-4 h-4 text-white relative z-10" />
              </div>
            </div>
            <span className="text-lg font-black text-white tracking-tighter font-display">
              PDF<span className="text-purple-500">ly</span>
            </span>
          </Link>

          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">
              Home
            </Link>
            <Link
              href="/tools"
              className="hover:text-white/60 transition-colors"
            >
              Tools
            </Link>
          </div>

          <p className="text-[11px] text-white/20">
            © {new Date().getFullYear()} PDFly by Murtuja. All tools run locally.
          </p>
        </div>
      </div>
    </footer>
  );
}

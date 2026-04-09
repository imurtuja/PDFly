"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

import { getToolBySlug } from "@/lib/tools";
import { AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();

  // Extract tool info if we're on a tool page
  const isToolPage = pathname.startsWith("/tool/");
  const toolSlug = isToolPage ? pathname.split("/").pop() : null;
  const activeTool = toolSlug ? getToolBySlug(toolSlug) : null;

  // Build dynamic navigation links
  const links = [
    { href: "/", label: "Home" },
    { href: "/tools", label: "Tools" },
    ...(activeTool ? [{ href: pathname, label: activeTool.name, icon: activeTool.icon, color: activeTool.color }] : [])
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] border-b border-white/5 bg-[#05040e]/80 backdrop-blur-xl flex items-center transition-all duration-300">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 rounded-xl blur-[2px] opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="relative w-full h-full rounded-xl bg-[#0d0c1d] border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <FileText className="w-5 h-5 text-white relative z-10" />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-black text-white tracking-tighter leading-none font-display">
              PDF<span className="text-purple-500">ly</span>
            </span>
          </div>
        </Link>

        {/* Center: Navigation (Desktop only) */}
        <motion.div 
          layout
          className="hidden md:flex items-center p-1 bg-white/[0.03] border border-white/5 rounded-full absolute left-1/2 -translate-x-1/2 overflow-hidden"
          transition={{ type: "spring", bounce: 0.05, duration: 0.5 }}
        >
          {links.slice(0, 2).map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname === link.href);
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-5 py-2 text-sm font-semibold transition-colors duration-300 flex items-center gap-2 ${
                  isActive ? "text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}

          <AnimatePresence mode="popLayout" initial={false}>
            {activeTool && (
              <motion.div
                key="active-tool-pill"
                layout
                initial={{ opacity: 0, x: -20, scale: 0.9, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, scale: 0.9, filter: "blur(4px)" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              >
                <Link
                  href={pathname}
                  className="relative px-5 py-2 text-sm font-semibold text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                  {activeTool.icon && (
                    <activeTool.icon 
                      className="w-3.5 h-3.5 relative z-10" 
                      style={{ color: activeTool.color }} 
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{activeTool.name}</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right: CTA (Desktop only) */}
        <div className="hidden md:flex items-center">
          <Link 
            href="/tools" 
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"
          >
            Get Started
          </Link>
        </div>
        
      </div>
    </nav>
  );
}

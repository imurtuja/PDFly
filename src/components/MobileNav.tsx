"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getToolBySlug } from "@/lib/tools";

export default function MobileNav() {
  const pathname = usePathname();

  // Dynamic tool detection
  const isToolPage = pathname.startsWith("/tool/");
  const toolSlug = isToolPage ? pathname.split("/").pop() : null;
  const activeTool = toolSlug ? getToolBySlug(toolSlug) : null;

  const links = [
    { id: "home", href: "/", label: "Home", icon: Home },
    { id: "tools", href: "/tools", label: "Tools", icon: Wrench },
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0d0c1d]/80 backdrop-blur-2xl border border-white/10 rounded-full p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <motion.div layout className="flex items-center">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.id === "tools" && pathname === "/tools");
          
          return (
            <Link
              key={link.id}
              href={link.href}
              className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full transition-colors duration-300 ${
                isActive ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <link.icon 
                className="relative z-10 w-4 h-4" 
                style={{ color: isActive ? "#a855f7" : "currentColor" }}
              />
              <span className="relative z-10 text-[9px] font-black uppercase tracking-wider">
                {link.label}
              </span>
            </Link>
          );
        })}

        <AnimatePresence mode="popLayout">
          {activeTool && (
            <motion.div
              key="active-tool"
              layout
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            >
              <Link
                href={pathname}
                className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-white"
              >
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
                <activeTool.icon 
                  className="relative z-10 w-4 h-4" 
                  style={{ color: activeTool.color }}
                />
                <span className="relative z-10 text-[9px] font-black uppercase tracking-wider truncate max-w-[65px]">
                  {activeTool.name.split(" ")[0]}
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
}

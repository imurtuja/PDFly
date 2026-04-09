"use client";

import { useEffect } from "react";

/**
 * LogSilencer intercepts and suppresses specific technical spam from PDF libraries 
 * to ensure a professional and clean development/production console experience.
 */
export default function LogSilencer() {
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;

    // List of "noise" patterns to ignore
    const noisePatterns = [
      "Trying to parse invalid object",
      "Invalid object ref",
      "Invalid Object",
      "Download the React DevTools",
    ];

    console.warn = (...args) => {
      const msg = args[0];
      if (typeof msg === "string" && noisePatterns.some(p => msg.includes(p))) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const msg = args[0];
      if (typeof msg === "string" && noisePatterns.some(p => msg.includes(p))) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null;
}

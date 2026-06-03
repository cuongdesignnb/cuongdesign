"use client";

import { useEffect, ReactNode } from "react";
import Lenis from "lenis";

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * MotionProvider
 * ─────────────
 * Wraps the app to provide:
 * 1. Lenis smooth scrolling with proper lifecycle
 * 2. Prefers-reduced-motion detection (Lenis respects it natively)
 * 3. Central place for future global animation context
 */
export default function MotionProvider({ children }: MotionProviderProps) {
  useEffect(() => {
    // Check user preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return; // Skip smooth scroll for accessibility

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

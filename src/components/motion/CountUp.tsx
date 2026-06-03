"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { motionTokens } from "@/lib/motion";

interface CountUpProps {
  /** Target number to count up to */
  to: number;
  /** Text to show after the number (e.g. "+", "%") */
  suffix?: string;
  /** Duration in seconds */
  duration?: number;
  className?: string;
  once?: boolean;
}

export default function CountUp({
  to,
  suffix = "",
  duration = 2,
  className = "",
  once = true,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(count, to, {
      duration,
      ease: motionTokens.ease.out as unknown as [number, number, number, number],
    });

    return () => controls.stop();
  }, [isInView, to, duration, count]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

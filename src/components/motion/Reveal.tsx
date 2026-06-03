"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import {
  fadeUpVariants,
  fadeLeftVariants,
  fadeRightVariants,
  scaleUpVariants,
  motionTokens,
} from "@/lib/motion";

type RevealDirection = "up" | "left" | "right" | "scale";

interface RevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
  /** Custom variants override */
  variants?: Variants;
}

const directionMap: Record<RevealDirection, Variants> = {
  up: fadeUpVariants,
  left: fadeLeftVariants,
  right: fadeRightVariants,
  scale: scaleUpVariants,
};

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration,
  className = "",
  once = true,
  amount = 0.2,
  variants: customVariants,
}: RevealProps) {
  const baseVariants = customVariants || directionMap[direction];

  // If delay or duration override, wrap transition
  const variants: Variants = {
    hidden: baseVariants.hidden,
    visible: {
      ...((baseVariants.visible as Record<string, unknown>) || {}),
      transition: {
        ...((
          (baseVariants.visible as Record<string, unknown>)
            ?.transition as Record<string, unknown>
        ) || {}),
        ...(delay ? { delay } : {}),
        ...(duration ? { duration } : {}),
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

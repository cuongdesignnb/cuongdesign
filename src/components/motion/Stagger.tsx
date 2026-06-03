"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import { motionTokens } from "@/lib/motion";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay between each child */
  stagger?: number;
  /** Initial delay before stagger starts */
  delayChildren?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "ul" | "section";
}

export default function Stagger({
  children,
  className = "",
  stagger = motionTokens.stagger.normal,
  delayChildren = 0.1,
  once = true,
  amount = 0.15,
  as = "div",
}: StaggerProps) {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };

  const Component = motion.create(as);

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </Component>
  );
}

"use client";

import { motion } from "framer-motion";
import GradientText from "../ui/GradientText";
import { motionTokens, fadeUpVariants } from "@/lib/motion";

interface AnimatedSectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center" | "right";
}

export default function AnimatedSectionHeading({
  title,
  subtitle,
  className = "",
  align = "center",
}: AnimatedSectionHeadingProps) {
  const alignClass =
    align === "center"
      ? "text-center items-center justify-center"
      : align === "right"
      ? "text-right items-end"
      : "text-left items-start";

  const slashIndex = title.indexOf("/");
  let mainTitle = title;
  let subText = "";

  if (slashIndex !== -1) {
    mainTitle = title.substring(0, slashIndex).trim();
    subText = title.substring(slashIndex + 1).trim();
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: motionTokens.stagger.fast,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: `blur(${motionTokens.blur.sm})`,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: motionTokens.duration.normal,
        ease: motionTokens.ease.out,
      },
    },
  };

  // Decorative line under heading
  const lineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.out,
        delay: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className={`flex flex-col mb-12 ${alignClass} ${className}`}
    >
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex flex-wrap gap-2 justify-center items-center">
        {mainTitle.split(" ").map((word, i) => (
          <motion.span key={i} variants={wordVariants}>
            {word}
          </motion.span>
        ))}
        {subText && (
          <>
            <motion.span variants={wordVariants} className="text-gray-600">
              /
            </motion.span>
            <motion.span variants={wordVariants}>
              <GradientText className="font-semibold">{subText}</GradientText>
            </motion.span>
          </>
        )}
      </h2>

      {/* Decorative gradient line */}
      <motion.div
        variants={lineVariants}
        className="h-0.5 w-16 mx-auto mt-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full origin-center"
      />

      {subtitle && (
        <motion.p
          variants={fadeUpVariants}
          className="mt-4 text-base md:text-lg text-gray-400 max-w-2xl"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

import React from "react";
import GradientText from "./GradientText";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center" | "right";
}

export default function SectionHeading({
  title,
  subtitle,
  className = "",
  align = "center",
}: SectionHeadingProps) {
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

  return (
    <div className={`flex flex-col mb-12 ${alignClass} ${className}`}>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex flex-wrap gap-2 justify-center items-center">
        <span>{mainTitle}</span>
        {subText && (
          <>
            <span className="text-gray-600">/</span>
            <GradientText className="font-semibold">{subText}</GradientText>
          </>
        )}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-gray-400 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

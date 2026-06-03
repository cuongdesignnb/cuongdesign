import React from "react";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

export default function GradientText({ children, className = "", ...props }: GradientTextProps) {
  return (
    <span className={`text-gradient font-bold ${className}`} {...props}>
      {children}
    </span>
  );
}

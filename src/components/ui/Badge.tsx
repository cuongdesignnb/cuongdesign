import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

export default function Badge({
  children,
  variant = "secondary",
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none";

  const variantStyles = {
    primary: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
    secondary: "bg-white/5 text-gray-300 border border-white/10",
    outline: "border border-white/15 text-white",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

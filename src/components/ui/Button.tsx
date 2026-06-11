import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-[#030014] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm md:text-base md:px-6 md:py-3",
    lg: "px-8 py-4 text-lg",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-[0_4px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_4px_25px_rgba(236,72,153,0.55)] hover:scale-[1.02]",
    secondary:
      "bg-white/10 text-white hover:bg-white/15 backdrop-blur-md border border-white/10",
    outline:
      "border border-white/15 text-white hover:bg-white/5 hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.15)]",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

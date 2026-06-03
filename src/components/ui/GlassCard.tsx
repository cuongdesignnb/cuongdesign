import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={`glass-card p-6 flex flex-col ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

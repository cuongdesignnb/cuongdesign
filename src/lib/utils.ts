import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  const formatted = new Intl.NumberFormat("vi-VN").format(amount);
  return `${formatted}vnđ`;
}

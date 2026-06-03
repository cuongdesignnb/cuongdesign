"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

// ─── Context ─────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx.toast;
}

// ─── Config ──────────────────────────────────────────────────
const TOAST_CONFIG: Record<ToastType, { icon: React.ElementType; bg: string; border: string; text: string; accent: string }> = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    accent: "bg-green-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    accent: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    accent: "bg-yellow-500",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    accent: "bg-blue-500",
  },
};

// ─── Toast Item ──────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;
  const [exiting, setExiting] = React.useState(false);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [onDismiss, toast.id]);

  React.useEffect(() => {
    const ms = toast.duration ?? (toast.type === "error" ? 6000 : 4000);
    const timer = setTimeout(handleDismiss, ms);
    return () => clearTimeout(timer);
  }, [handleDismiss, toast.duration, toast.type]);

  return (
    <div
      className={`
        relative flex items-start gap-3 w-[380px] max-w-[calc(100vw-2rem)] p-4 rounded-xl border backdrop-blur-xl shadow-2xl
        ${config.bg} ${config.border}
        transition-all duration-200 ease-out
        ${exiting ? "opacity-0 translate-x-8 scale-95" : "opacity-100 translate-x-0 scale-100"}
      `}
      style={{ animation: exiting ? "none" : "toast-in 0.3s ease-out" }}
      role="alert"
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${config.accent}`} />

      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.text}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{toast.message}</p>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="shrink-0 text-gray-500 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${++counterRef.current}-${Date.now()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]); // max 5
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useMemo(
    () => ({
      success: (title: string, message?: string) => addToast("success", title, message),
      error: (title: string, message?: string) => addToast("error", title, message),
      warning: (title: string, message?: string) => addToast("warning", title, message),
      info: (title: string, message?: string) => addToast("info", title, message),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={removeToast} />
          </div>
        ))}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(100%) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
